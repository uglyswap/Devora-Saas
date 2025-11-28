from fastapi import APIRouter, HTTPException, Depends, status
from motor.motor_asyncio import AsyncIOMotorClient
import os
from models import User, UserCreate, UserLogin, UserResponse, Token
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from stripe_service import StripeService
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/auth', tags=['authentication'])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.post('/register', response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if user exists
    existing_user = await db.users.find_one({'email': user_data.email}, {'_id': 0})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Email already registered'
        )
    
    # Create Stripe customer
    try:
        stripe_customer_id = await StripeService.create_customer(
            email=user_data.email,
            name=user_data.full_name
        )
    except Exception as e:
        logger.error(f'Failed to create Stripe customer: {str(e)}')
        stripe_customer_id = None
    
    # Create user
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        stripe_customer_id=stripe_customer_id
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    user_dict['updated_at'] = user_dict['updated_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(data={'sub': user.id, 'email': user.email})
    
    logger.info(f'New user registered: {user.email}')
    
    return Token(access_token=access_token, token_type='bearer')

@router.post('/login', response_model=Token)
async def login(credentials: UserLogin):
    """Login user"""
    user = await db.users.find_one({'email': credentials.email}, {'_id': 0})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect email or password'
        )
    
    if not verify_password(credentials.password, user['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect email or password'
        )
    
    if not user.get('is_active', True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Account is deactivated'
        )
    
    access_token = create_access_token(data={'sub': user['id'], 'email': user['email']})
    
    logger.info(f'User logged in: {user["email"]}')
    
    return Token(access_token=access_token, token_type='bearer')

@router.get('/me', response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    user = await db.users.find_one({'id': current_user['user_id']}, {'_id': 0, 'hashed_password': 0})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found'
        )
    
    # Convert datetime strings to datetime objects
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    if isinstance(user.get('updated_at'), str):
        user['updated_at'] = datetime.fromisoformat(user['updated_at'])
    if isinstance(user.get('current_period_end'), str):
        user['current_period_end'] = datetime.fromisoformat(user['current_period_end'])
    
    return UserResponse(**user)
