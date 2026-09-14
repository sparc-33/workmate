from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration, loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "mysql+asyncmy://app_user:app_password@localhost:3306/workmate"

    # JWT
    jwt_secret_key: str = "change-me-to-a-long-random-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60


settings = Settings()
