from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from email_service import EmailService
import logging
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/support', tags=['support'])

# MongoDB connection
client = AsyncIOMotorClient(settings.MONGO_URL)
db = client[settings.DB_NAME]

# Initialize email service
email_service = EmailService(db)


class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str = ''
    message: str


@router.post('/contact')
async def send_contact_message(contact: ContactMessage):
    """Handle contact form submissions"""
    try:
        # Send notification email to admin/support
        html = EmailService.get_contact_notification_email(
            contact.name,
            contact.email,
            contact.message
        )
        
        # Send to support email (you can configure this)
        await email_service.send_email(
            to='support@devora.fun',  # Admin email
            subject=f'Nouveau message de contact: {contact.subject or "Sans sujet"}',
            html=html
        )
        
        # Send confirmation email to user
        confirmation_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .header h1 {{ color: white; margin: 0; font-size: 28px; }}
                .content {{ background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>✅ Message bien reçu !</h1>
            </div>
            <div class="content">
                <p>Bonjour {contact.name},</p>
                
                <p>Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.</p>
                
                <p>Notre équipe de support vous répondra dans les plus brefs délais, généralement sous 24 heures.</p>
                
                <p><strong>Récapitulatif de votre message :</strong></p>
                <div style="background: white; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0;">
                    <p><strong>Sujet :</strong> {contact.subject or 'Non spécifié'}</p>
                    <p style="margin-top: 10px;"><strong>Message :</strong></p>
                    <p>{contact.message[:200]}{'...' if len(contact.message) > 200 else ''}</p>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                    Si vous avez d'autres questions, n'hésitez pas à nous contacter à nouveau.
                </p>
            </div>
            <div class="footer">
                <p>Devora - Génération de code intelligente avec IA</p>
                <p><a href="https://devora.fun" style="color: #10b981;">devora.fun</a></p>
            </div>
        </body>
        </html>
        """
        
        await email_service.send_email(
            to=contact.email,
            subject='Votre message a été reçu - Support Devora',
            html=confirmation_html
        )
        
        logger.info(f'Contact message received from {contact.email}')
        
        return {
            'status': 'success',
            'message': 'Message envoyé avec succès. Nous vous répondrons sous 24h.'
        }
    
    except Exception as e:
        logger.error(f'Error sending contact message: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Erreur lors de l\'envoi du message'
        )
