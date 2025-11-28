import httpx
import os
import logging
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class EmailService:
    """Service for sending emails via Resend"""
    
    RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
    FROM_EMAIL = 'noreply@devora.fun'
    FROM_NAME = 'Devora'
    
    @staticmethod
    async def send_email(to: str, subject: str, html: str) -> bool:
        """Send an email via Resend"""
        if not EmailService.RESEND_API_KEY:
            logger.warning('RESEND_API_KEY not configured, skipping email')
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    'https://api.resend.com/emails',
                    headers={
                        'Authorization': f'Bearer {EmailService.RESEND_API_KEY}',
                        'Content-Type': 'application/json'
                    },
                    json={
                        'from': f'{EmailService.FROM_NAME} <{EmailService.FROM_EMAIL}>',
                        'to': [to],
                        'subject': subject,
                        'html': html
                    },
                    timeout=10.0
                )
                
                if response.status_code in [200, 201]:
                    logger.info(f'Email sent successfully to {to}')
                    return True
                else:
                    logger.error(f'Failed to send email: {response.status_code} - {response.text}')
                    return False
        except Exception as e:
            logger.error(f'Error sending email: {str(e)}')
            return False
    
    @staticmethod
    def get_welcome_email(name: str) -> str:
        """Template: Welcome email after registration"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .header h1 {{ color: white; margin: 0; font-size: 32px; }}
                .content {{ background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #10b981; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>✨ Bienvenue sur Devora !</h1>
            </div>
            <div class="content">
                <p>Bonjour {name or 'cher utilisateur'},</p>
                
                <p>Merci de vous être inscrit sur <strong>Devora</strong> ! 🎉</p>
                
                <p>Votre compte a été créé avec succès. Vous bénéficiez de <strong>7 jours d'essai gratuit</strong> pour découvrir toutes les fonctionnalités de notre système agentique de génération de code.</p>
                
                <p><strong>Que faire maintenant ?</strong></p>
                <ul>
                    <li>🤖 Découvrez le système agentique multi-agents</li>
                    <li>💻 Générez du code avec l'IA</li>
                    <li>📦 Créez vos premiers projets</li>
                    <li>🚀 Exportez sur GitHub et déployez sur Vercel</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="https://devora.fun/editor" class="button">Commencer maintenant</a>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                    <strong>Note :</strong> Votre essai gratuit se termine dans 7 jours. Vous recevrez un rappel avant la fin de votre période d'essai.
                </p>
            </div>
            <div class="footer">
                <p>Devora - Génération de code intelligente avec IA</p>
                <p><a href="https://devora.fun" style="color: #10b981;">devora.fun</a></p>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def get_trial_ending_email(name: str, days_left: int) -> str:
        """Template: Trial ending reminder"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .header h1 {{ color: white; margin: 0; font-size: 28px; }}
                .content {{ background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #10b981; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }}
                .price {{ font-size: 36px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>⏰ Votre essai se termine dans {days_left} jour{'s' if days_left > 1 else ''}</h1>
            </div>
            <div class="content">
                <p>Bonjour {name or 'cher utilisateur'},</p>
                
                <p>Votre période d'essai gratuit de Devora touche à sa fin !</p>
                
                <p>Pour continuer à profiter de toutes les fonctionnalités :</p>
                <ul>
                    <li>🤖 Système agentique illimité</li>
                    <li>💻 Génération de code sans limite</li>
                    <li>📦 Projets illimités</li>
                    <li>🚀 Export GitHub & Vercel</li>
                    <li>💬 Support prioritaire</li>
                </ul>
                
                <div class="price">9,90€ TTC / mois</div>
                
                <div style="text-align: center;">
                    <a href="https://devora.fun/billing" class="button">S'abonner maintenant</a>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                    Sans action de votre part, votre accès sera suspendu à la fin de la période d'essai.
                </p>
            </div>
            <div class="footer">
                <p>Devora - Génération de code intelligente avec IA</p>
                <p><a href="https://devora.fun" style="color: #10b981;">devora.fun</a></p>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def get_subscription_success_email(name: str) -> str:
        """Template: Subscription confirmed"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .header h1 {{ color: white; margin: 0; font-size: 32px; }}
                .content {{ background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #10b981; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎉 Abonnement activé !</h1>
            </div>
            <div class="content">
                <p>Bonjour {name or 'cher utilisateur'},</p>
                
                <p>Merci d'avoir souscrit à <strong>Devora Pro</strong> !</p>
                
                <p>Votre abonnement est maintenant actif et vous avez accès à :</p>
                <ul>
                    <li>✅ Système agentique illimité</li>
                    <li>✅ Génération de code sans restriction</li>
                    <li>✅ Projets illimités</li>
                    <li>✅ Export GitHub & Vercel</li>
                    <li>✅ Support prioritaire</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="https://devora.fun/dashboard" class="button">Accéder à Devora</a>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                    Vous recevrez une facture par email à chaque renouvellement mensuel. Vous pouvez gérer votre abonnement à tout moment depuis votre espace client.
                </p>
            </div>
            <div class="footer">
                <p>Devora - Génération de code intelligente avec IA</p>
                <p><a href="https://devora.fun/billing" style="color: #10b981;">Gérer mon abonnement</a></p>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def get_invoice_email(name: str, amount: float, invoice_url: str, period: str) -> str:
        """Template: Monthly invoice"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .header h1 {{ color: white; margin: 0; font-size: 28px; }}
                .content {{ background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }}
                .invoice-box {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }}
                .amount {{ font-size: 32px; font-weight: bold; color: #10b981; }}
                .button {{ display: inline-block; background: #3b82f6; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📄 Votre facture Devora</h1>
            </div>
            <div class="content">
                <p>Bonjour {name or 'cher utilisateur'},</p>
                
                <p>Votre paiement pour Devora Pro a bien été reçu.</p>
                
                <div class="invoice-box">
                    <table width="100%" style="border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0;"><strong>Période</strong></td>
                            <td style="text-align: right; padding: 10px 0;">{period}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0;"><strong>Plan</strong></td>
                            <td style="text-align: right; padding: 10px 0;">Devora Pro</td>
                        </tr>
                        <tr style="border-top: 2px solid #e5e7eb;">
                            <td style="padding: 10px 0;"><strong>Montant TTC</strong></td>
                            <td style="text-align: right; padding: 10px 0;"><span class="amount">{amount:.2f}€</span></td>
                        </tr>
                    </table>
                </div>
                
                <div style="text-align: center;">
                    <a href="{invoice_url}" class="button">Télécharger la facture PDF</a>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                    Merci de votre confiance ! Cette facture est également disponible dans votre espace client.
                </p>
            </div>
            <div class="footer">
                <p>Devora - Génération de code intelligente avec IA</p>
                <p><a href="https://devora.fun/billing" style="color: #10b981;">Voir toutes mes factures</a></p>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def get_payment_failed_email(name: str, amount: float) -> str:
        """Template: Payment failed"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .header h1 {{ color: white; margin: 0; font-size: 28px; }}
                .content {{ background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #ef4444; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>⚠️ Échec de paiement</h1>
            </div>
            <div class="content">
                <p>Bonjour {name or 'cher utilisateur'},</p>
                
                <p>Le paiement de votre abonnement Devora Pro ({amount:.2f}€) n'a pas pu être traité.</p>
                
                <p><strong>Raisons possibles :</strong></p>
                <ul>
                    <li>Carte bancaire expirée</li>
                    <li>Fonds insuffisants</li>
                    <li>Problème avec votre banque</li>
                </ul>
                
                <p><strong>Que faire ?</strong></p>
                <p>Stripe va automatiquement réessayer dans quelques jours. Vous pouvez également mettre à jour vos informations de paiement dès maintenant :</p>
                
                <div style="text-align: center;">
                    <a href="https://devora.fun/billing" class="button">Mettre à jour mon paiement</a>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #ef4444; font-weight: 600;">
                    ⚠️ Après 3 échecs de paiement, votre accès à Devora sera suspendu.
                </p>
            </div>
            <div class="footer">
                <p>Devora - Génération de code intelligente avec IA</p>
                <p>Des questions ? <a href="https://devora.fun/contact" style="color: #10b981;">Contactez-nous</a></p>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def get_subscription_canceled_email(name: str, end_date: str) -> str:
        """Template: Subscription canceled"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .header h1 {{ color: white; margin: 0; font-size: 28px; }}
                .content {{ background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #10b981; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Abonnement annulé</h1>
            </div>
            <div class="content">
                <p>Bonjour {name or 'cher utilisateur'},</p>
                
                <p>Votre abonnement à Devora Pro a été annulé.</p>
                
                <p>Vous conservez l'accès à toutes les fonctionnalités jusqu'au <strong>{end_date}</strong>.</p>
                
                <p>Nous sommes tristes de vous voir partir ! 😢</p>
                
                <p>Si vous changez d'avis, vous pouvez vous réabonner à tout moment :</p>
                
                <div style="text-align: center;">
                    <a href="https://devora.fun/billing" class="button">Me réabonner</a>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                    Vous avez des suggestions pour améliorer Devora ? N'hésitez pas à nous contacter !
                </p>
            </div>
            <div class="footer">
                <p>Devora - Génération de code intelligente avec IA</p>
                <p><a href="https://devora.fun/contact" style="color: #10b981;">Contactez-nous</a></p>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def get_contact_notification_email(name: str, email: str, message: str) -> str:
        """Template: Contact form notification (internal)"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #10b981; padding: 20px; color: white; }}
                .content {{ background: #f9fafb; padding: 20px; }}
                .message-box {{ background: white; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h2>📬 Nouveau message de contact</h2>
            </div>
            <div class="content">
                <p><strong>De :</strong> {name} ({email})</p>
                <div class="message-box">
                    <p><strong>Message :</strong></p>
                    <p>{message}</p>
                </div>
                <p><small>Reçu le {datetime.now().strftime('%d/%m/%Y à %H:%M')}</small></p>
            </div>
        </body>
        </html>
        """
