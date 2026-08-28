import logging
from app.db.session import SessionLocal
from app.db.models import User
from app.core.security import get_password_hash

logger = logging.getLogger("software_failure.db_init")

DEFAULT_USERS = [
    {
        "email": "engineer@company.com",
        "password": "Password123!",
        "full_name": "Lead Software Engineer",
        "role": "engineer",
    },
    {
        "email": "admin@company.com",
        "password": "Admin123!",
        "full_name": "System Administrator",
        "role": "admin",
    },
    {
        "email": "demo@foresafe.ai",
        "password": "Demo1234!",
        "full_name": "ForeSafe Demo User",
        "role": "engineer",
    },
]

def init_default_users():
    """Seeds default demo/admin user accounts into the database if they do not exist."""
    db = SessionLocal()
    try:
        for user_info in DEFAULT_USERS:
            existing = db.query(User).filter(User.email == user_info["email"]).first()
            if not existing:
                new_user = User(
                    full_name=user_info["full_name"],
                    email=user_info["email"],
                    hashed_password=get_password_hash(user_info["password"]),
                    auth_provider="local",
                    is_verified=True,
                )
                db.add(new_user)
                logger.info(f"Seeded default user account: {user_info['email']}")
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding default users: {e}")
    finally:
        db.close()
