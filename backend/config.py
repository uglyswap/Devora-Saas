"""
Configuration centralisée pour l'application Devora.
Charge les variables d'environnement et fournit une interface unique pour accéder aux configs.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path


class Settings(BaseSettings):
    """Configuration de l'application chargée depuis .env"""
    
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).parent / '.env'),
        env_file_encoding='utf-8',
        case_sensitive=False,
        extra='ignore'
    )
    
    # Database
    MONGO_URL: str
    DB_NAME: str = "devora_db"
    
    # JWT Authentication
    SECRET_KEY: str  # Must be set in environment variables
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Stripe (optionnel - peut être configuré via admin panel)
    STRIPE_API_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # Resend (optionnel - peut être configuré via admin panel)
    RESEND_API_KEY: Optional[str] = None
    
    # App
    APP_NAME: str = "Devora"
    FRONTEND_URL: str  # Must be set in environment variables
    
    # Emergent LLM
    EMERGENT_LLM_KEY: Optional[str] = None


# Instance globale unique
settings = Settings()
