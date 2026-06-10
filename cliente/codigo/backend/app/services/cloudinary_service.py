import cloudinary
import cloudinary.uploader
from ..core.config import settings

# Configurar Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

class CloudinaryService:
    @staticmethod
    def upload_image(file, folder="el-zapatito/products"):
        try:
            upload_result = cloudinary.uploader.upload(file, folder=folder)
            return upload_result.get("secure_url")
        except Exception as e:
            print(f"Error al subir a Cloudinary: {e}")
            return None

    @staticmethod
    def delete_image(public_id):
        try:
            cloudinary.uploader.destroy(public_id)
            return True
        except Exception as e:
            print(f"Error al eliminar de Cloudinary: {e}")
            return False
