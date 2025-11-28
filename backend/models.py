from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid

class User(BaseModel):
    model_config = ConfigDict(extra='ignore')
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    hashed_password: str
    full_name: Optional[str] = None
    is_active: bool = True
    is_admin: bool = False
    stripe_customer_id: Optional[str] = None
    subscription_status: str = 'inactive'  # inactive, active, canceled, past_due
    subscription_id: Optional[str] = None
    current_period_end: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    is_active: bool
    subscription_status: str
    current_period_end: Optional[datetime]
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class SubscriptionPlan(BaseModel):
    name: str = 'Pro'
    price: float = 9.90
    currency: str = 'eur'
    interval: str = 'month'
    features: List[str] = [
        'Accès illimité au système agentique',
        'Génération de code sans limite',
        'Projets illimités',
        'Export GitHub et Vercel',
        'Support prioritaire'
    ]

class Invoice(BaseModel):
    model_config = ConfigDict(extra='ignore')
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    stripe_invoice_id: str
    amount: float
    currency: str
    status: str  # paid, open, void, uncollectible
    invoice_pdf: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminStats(BaseModel):
    total_users: int
    active_subscriptions: int
    total_revenue: float
    total_projects: int
    new_users_this_month: int
    churn_rate: float
