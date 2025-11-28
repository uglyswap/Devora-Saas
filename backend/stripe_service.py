import stripe
from typing import Optional
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from config_service import ConfigService

logger = logging.getLogger(__name__)


class StripeService:
    """Service for handling Stripe operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.config_service = ConfigService(db)
        self._stripe_configured = False
    
    async def _ensure_stripe_configured(self):
        """Configure Stripe avec les clés de la DB"""
        if not self._stripe_configured:
            api_key, webhook_secret, test_mode = await self.config_service.get_stripe_keys()
            if api_key:
                stripe.api_key = api_key
                self._stripe_configured = True
                logger.info(f"Stripe configured in {'test' if test_mode else 'live'} mode")
            else:
                logger.warning("Stripe API key not configured in system settings")
    
    async def get_webhook_secret(self) -> Optional[str]:
        """Retourne le webhook secret depuis la config"""
        _, webhook_secret, _ = await self.config_service.get_stripe_keys()
        return webhook_secret
    
    async def create_customer(self, email: str, name: Optional[str] = None) -> str:
        """Create a Stripe customer"""
        await self._ensure_stripe_configured()
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata={'source': 'devora'}
            )
            logger.info(f'Created Stripe customer: {customer.id}')
            return customer.id
        except stripe.error.StripeError as e:
            logger.error(f'Error creating Stripe customer: {str(e)}')
            raise
    
    async def create_checkout_session(
        self,
        customer_id: str,
        success_url: str,
        cancel_url: str,
        user_id: str,
        trial_days: int = 7
    ) -> dict:
        """Create a Stripe checkout session for subscription"""
        await self._ensure_stripe_configured()
        billing_settings = await self.config_service.get_billing_settings()
        
        try:
            # Créer dynamiquement le prix avec le montant de la config
            price = stripe.Price.create(
                unit_amount=int(billing_settings["price"] * 100),  # Convertir en centimes
                currency="eur",
                recurring={"interval": "month"},
                product_data={
                    "name": "Devora Pro",
                    "description": "Accès complet à la plateforme Devora"
                }
            )
            
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=['card'],
                line_items=[{
                    'price': price.id,
                    'quantity': 1,
                }],
                mode='subscription',
                subscription_data={
                    'trial_period_days': trial_days
                },
                success_url=success_url + '?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=cancel_url,
                metadata={
                    'user_id': user_id
                },
                allow_promotion_codes=True,
            )
            return {
                'session_id': session.id,
                'url': session.url
            }
        except stripe.error.StripeError as e:
            logger.error(f'Error creating checkout session: {str(e)}')
            raise
    
    async def create_portal_session(self, customer_id: str, return_url: str) -> str:
        """Create a Stripe customer portal session for managing subscription"""
        await self._ensure_stripe_configured()
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            return session.url
        except stripe.error.StripeError as e:
            logger.error(f'Error creating portal session: {str(e)}')
            raise
    
    async def cancel_subscription(self, subscription_id: str) -> bool:
        """Cancel a subscription"""
        await self._ensure_stripe_configured()
        try:
            stripe.Subscription.delete(subscription_id)
            logger.info(f'Canceled subscription: {subscription_id}')
            return True
        except stripe.error.StripeError as e:
            logger.error(f'Error canceling subscription: {str(e)}')
            return False
    
    async def get_subscription(self, subscription_id: str) -> Optional[dict]:
        """Get subscription details"""
        await self._ensure_stripe_configured()
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return {
                'id': subscription.id,
                'status': subscription.status,
                'current_period_end': subscription.current_period_end,
                'cancel_at_period_end': subscription.cancel_at_period_end
            }
        except stripe.error.StripeError as e:
            logger.error(f'Error retrieving subscription: {str(e)}')
            return None
    
    async def list_invoices(self, customer_id: str, limit: int = 10) -> list:
        """List customer invoices"""
        await self._ensure_stripe_configured()
        try:
            invoices = stripe.Invoice.list(
                customer=customer_id,
                limit=limit
            )
            return [{
                'id': inv.id,
                'amount': inv.amount_paid / 100,  # Convert from cents
                'currency': inv.currency,
                'status': inv.status,
                'invoice_pdf': inv.invoice_pdf,
                'created': inv.created
            } for inv in invoices.data]
        except stripe.error.StripeError as e:
            logger.error(f'Error listing invoices: {str(e)}')
            return []
    
    @staticmethod
    def verify_webhook_signature(payload: bytes, sig_header: str) -> dict:
        """Verify Stripe webhook signature"""
        webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
            return event
        except ValueError:
            raise ValueError('Invalid payload')
        except stripe.error.SignatureVerificationError:
            raise ValueError('Invalid signature')
