"""
Script pour créer un utilisateur administrateur
Usage: python create_admin.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from auth import get_password_hash
from config import settings
import uuid
from datetime import datetime, timezone

async def create_admin_user():
    """Crée un utilisateur admin dans la base de données"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.MONGO_URL)
    db = client[settings.DB_NAME]
    
    admin_email = "admin@devora.fun"
    admin_password = "Admin123!"  # À changer après première connexion
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": admin_email}, {"_id": 0})
    
    if existing_admin:
        print(f"✅ Admin user already exists: {admin_email}")
        print(f"   ID: {existing_admin['id']}")
        print(f"   Is Admin: {existing_admin.get('is_admin', False)}")
        
        # Update to admin if not already
        if not existing_admin.get('is_admin'):
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"is_admin": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            print(f"   ✅ Updated to admin status")
    else:
        # Create new admin user
        admin_user = {
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "hashed_password": get_password_hash(admin_password),
            "full_name": "Admin Devora",
            "is_active": True,
            "is_admin": True,
            "stripe_customer_id": None,
            "subscription_status": "active",  # Admin has full access
            "subscription_id": None,
            "current_period_end": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(admin_user)
        print(f"✅ Admin user created successfully!")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        print(f"   ⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!")
    
    client.close()

if __name__ == "__main__":
    print("🔐 Creating admin user...")
    asyncio.run(create_admin_user())
    print("\n✅ Done!")
