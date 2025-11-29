from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from models import AdminStats, SystemConfig, SystemConfigUpdate
from auth import get_current_admin_user
from config_service import ConfigService
from datetime import datetime, timezone, timedelta
import logging
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/admin', tags=['admin'])

# MongoDB connection with centralized config
client = AsyncIOMotorClient(settings.MONGO_URL)
db = client[settings.DB_NAME]

# Initialize config service
config_service = ConfigService(db)

@router.get('/stats', response_model=AdminStats)
async def get_admin_stats(current_admin: dict = Depends(get_current_admin_user)):
    """Get admin dashboard statistics"""
    
    # Total users
    total_users = await db.users.count_documents({})
    
    # Active subscriptions
    active_subscriptions = await db.users.count_documents({'subscription_status': 'active'})
    
    # Total projects
    total_projects = await db.projects.count_documents({})
    
    # Calculate date ranges
    now = datetime.now(timezone.utc)
    start_of_current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Start of last month
    if now.month == 1:
        start_of_last_month = now.replace(year=now.year - 1, month=12, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        start_of_last_month = now.replace(month=now.month - 1, day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Revenue calculations
    all_invoices = await db.invoices.find({'status': 'paid'}, {'_id': 0}).to_list(None)
    
    # Total revenue (cumulé)
    total_revenue = sum(inv.get('amount', 0) for inv in all_invoices)
    
    # Revenue du mois en cours
    revenue_current_month = 0
    for inv in all_invoices:
        created_at_str = inv.get('created_at')
        if created_at_str:
            try:
                if isinstance(created_at_str, str):
                    inv_date = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
                else:
                    inv_date = created_at_str
                
                if inv_date >= start_of_current_month:
                    revenue_current_month += inv.get('amount', 0)
            except:
                pass
    
    # Revenue du mois dernier
    revenue_last_month = 0
    for inv in all_invoices:
        created_at_str = inv.get('created_at')
        if created_at_str:
            try:
                if isinstance(created_at_str, str):
                    inv_date = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
                else:
                    inv_date = created_at_str
                
                if start_of_last_month <= inv_date < start_of_current_month:
                    revenue_last_month += inv.get('amount', 0)
            except:
                pass
    
    # New users this month
    new_users_pipeline = [
        {
            '$addFields': {
                'created_at_date': {
                    '$dateFromString': {
                        'dateString': '$created_at',
                        'onError': None
                    }
                }
            }
        },
        {
            '$match': {
                'created_at_date': {'$gte': start_of_current_month}
            }
        },
        {'$count': 'count'}
    ]
    new_users_result = await db.users.aggregate(new_users_pipeline).to_list(1)
    new_users_this_month = new_users_result[0]['count'] if new_users_result else 0
    
    # Cancellations - chercher dans les users avec subscription_status = 'canceled'
    # et vérifier quand l'annulation a eu lieu (on peut utiliser updated_at ou créer un champ canceled_at)
    # Pour l'instant, on compte tous les canceled comme approximation
    all_canceled = await db.users.find({'subscription_status': 'canceled'}, {'_id': 0}).to_list(None)
    
    cancellations_current_month = 0
    cancellations_last_month = 0
    
    for user in all_canceled:
        updated_at_str = user.get('updated_at')
        if updated_at_str:
            try:
                if isinstance(updated_at_str, str):
                    updated_date = datetime.fromisoformat(updated_at_str.replace('Z', '+00:00'))
                else:
                    updated_date = updated_at_str
                
                if updated_date >= start_of_current_month:
                    cancellations_current_month += 1
                elif start_of_last_month <= updated_date < start_of_current_month:
                    cancellations_last_month += 1
            except:
                pass
    
    # Churn rate (basé sur le mois en cours)
    churn_rate = (cancellations_current_month / total_users * 100) if total_users > 0 else 0.0
    
    return AdminStats(
        total_users=total_users,
        active_subscriptions=active_subscriptions,
        total_revenue=round(total_revenue, 2),
        revenue_last_month=round(revenue_last_month, 2),
        revenue_current_month=round(revenue_current_month, 2),
        total_projects=total_projects,
        new_users_this_month=new_users_this_month,
        churn_rate=round(churn_rate, 2),
        cancellations_current_month=cancellations_current_month,
        cancellations_last_month=cancellations_last_month
    )

@router.get('/users')
async def get_all_users(
    skip: int = 0,
    limit: int = 50,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Get all users (admin only)"""
    users = await db.users.find(
        {},
        {'_id': 0, 'hashed_password': 0}
    ).skip(skip).limit(limit).to_list(limit)
    
    return {
        'users': users,
        'skip': skip,
        'limit': limit
    }

@router.put('/users/{user_id}/status')
async def update_user_status(
    user_id: str,
    is_active: bool,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Activate or deactivate a user"""
    result = await db.users.update_one(
        {'id': user_id},
        {'$set': {'is_active': is_active, 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail='User not found')
    
    return {'message': f'User {"activated" if is_active else "deactivated"} successfully'}


@router.get('/config', response_model=SystemConfig)
async def get_system_config(current_admin: dict = Depends(get_current_admin_user)):
    """Get system configuration (Stripe, Resend, billing settings)"""
    config = await config_service.get_config()
    return config

@router.put('/config', response_model=SystemConfig)
async def update_system_config(
    config_update: SystemConfigUpdate,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Update system configuration"""
    updated_config = await config_service.update_config(
        config_update, 
        current_admin['user_id']
    )
    logger.info(f'System config updated by admin {current_admin["email"]}')
    return updated_config

@router.post('/users/{user_id}/promote-admin')
async def promote_to_admin(
    user_id: str,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Promote a user to admin status"""
    user = await db.users.find_one({'id': user_id}, {'_id': 0})
    
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    if user.get('is_admin'):
        return {'message': 'User is already an admin', 'user': user['email']}
    
    result = await db.users.update_one(
        {'id': user_id},
        {'$set': {'is_admin': True, 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail='Failed to promote user')
    
    logger.info(f'User {user["email"]} promoted to admin by {current_admin["email"]}')
    
    return {
        'message': f'User {user["email"]} successfully promoted to admin',
        'user_id': user_id,
        'email': user['email']
    }

@router.delete('/users/{user_id}/revoke-admin')
async def revoke_admin(
    user_id: str,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Revoke admin status from a user"""
    user = await db.users.find_one({'id': user_id}, {'_id': 0})
    
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    if not user.get('is_admin'):
        return {'message': 'User is not an admin', 'user': user['email']}
    
    # Prevent revoking own admin status
    if user_id == current_admin['user_id']:
        raise HTTPException(
            status_code=400, 
            detail='Cannot revoke your own admin status'
        )
    
    result = await db.users.update_one(
        {'id': user_id},
        {'$set': {'is_admin': False, 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail='Failed to revoke admin status')
    
    logger.info(f'Admin status revoked from {user["email"]} by {current_admin["email"]}')
    
    return {
        'message': f'Admin status revoked from {user["email"]}',
        'user_id': user_id,
        'email': user['email']
    }


@router.get('/users/{user_id}/projects')
async def get_user_projects(
    user_id: str,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Get all projects for a specific user"""
    projects = await db.projects.find({'user_id': user_id}, {'_id': 0}).to_list(1000)
    return {'projects': projects, 'count': len(projects)}

@router.get('/users/{user_id}/invoices')
async def get_user_invoices(
    user_id: str,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Get all invoices for a specific user"""
    invoices = await db.invoices.find({'user_id': user_id}, {'_id': 0}).to_list(1000)
    
    # Calculate total paid
    total_paid = sum(inv.get('amount', 0) for inv in invoices if inv.get('status') == 'paid')
    
    return {
        'invoices': invoices,
        'count': len(invoices),
        'total_paid': total_paid
    }

@router.post('/users/{user_id}/gift-months')
async def gift_free_months(
    user_id: str,
    months: int,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Gift free months to a user"""
    if months < 1 or months > 12:
        raise HTTPException(status_code=400, detail='Months must be between 1 and 12')
    
    user = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    # Calculate new end date
    from dateutil.relativedelta import relativedelta
    current_end = user.get('current_period_end')
    
    if current_end:
        try:
            current_date = datetime.fromisoformat(current_end)
        except:
            current_date = datetime.now(timezone.utc)
    else:
        current_date = datetime.now(timezone.utc)
    
    new_end_date = current_date + relativedelta(months=months)
    
    await db.users.update_one(
        {'id': user_id},
        {
            '$set': {
                'current_period_end': new_end_date.isoformat(),
                'subscription_status': 'active',
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    logger.info(f'Admin {current_admin["email"]} gifted {months} month(s) to {user["email"]}')
    
    return {
        'message': f'Successfully gifted {months} month(s)',
        'new_end_date': new_end_date.isoformat()
    }

@router.post('/users/{user_id}/toggle-billing')
async def toggle_billing(
    user_id: str,
    enable: bool,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Enable or disable billing for a user"""
    user = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    # Add a flag to indicate billing exemption
    await db.users.update_one(
        {'id': user_id},
        {
            '$set': {
                'billing_exempt': not enable,
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    logger.info(f'Admin {current_admin["email"]} {"enabled" if enable else "disabled"} billing for {user["email"]}')
    
    return {
        'message': f'Billing {"enabled" if enable else "disabled"} for user',
        'billing_exempt': not enable
    }


