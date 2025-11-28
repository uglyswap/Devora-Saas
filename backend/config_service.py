"""
Service pour gérer la configuration système stockée en DB.
Les configurations Stripe/Resend peuvent être modifiées via l'admin panel.
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import SystemConfig, SystemConfigUpdate
from typing import Optional
from datetime import datetime, timezone


class ConfigService:
    """Service de gestion de la configuration système"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.system_config
    
    async def get_config(self) -> SystemConfig:
        """Récupère la configuration système (crée si n'existe pas)"""
        config_data = await self.collection.find_one(
            {"id": "system_config"},
            {"_id": 0}
        )
        
        if not config_data:
            # Créer la config par défaut
            default_config = SystemConfig()
            await self.collection.insert_one(default_config.model_dump())
            return default_config
        
        return SystemConfig(**config_data)
    
    async def update_config(
        self, 
        updates: SystemConfigUpdate, 
        admin_id: str
    ) -> SystemConfig:
        """Met à jour la configuration système"""
        update_data = {
            k: v for k, v in updates.model_dump().items() 
            if v is not None
        }
        update_data["updated_at"] = datetime.now(timezone.utc)
        update_data["updated_by"] = admin_id
        
        await self.collection.update_one(
            {"id": "system_config"},
            {"$set": update_data},
            upsert=True
        )
        
        return await self.get_config()
    
    async def get_stripe_keys(self) -> tuple[Optional[str], Optional[str], bool]:
        """Retourne (api_key, webhook_secret, test_mode)"""
        config = await self.get_config()
        return (
            config.stripe_api_key,
            config.stripe_webhook_secret,
            config.stripe_test_mode
        )
    
    async def get_resend_config(self) -> tuple[Optional[str], str]:
        """Retourne (api_key, from_email)"""
        config = await self.get_config()
        return (config.resend_api_key, config.resend_from_email)
    
    async def get_billing_settings(self) -> dict:
        """Retourne les paramètres de facturation"""
        config = await self.get_config()
        return {
            "price": config.subscription_price,
            "free_trial_days": config.free_trial_days,
            "max_failed_payments": config.max_failed_payments
        }
