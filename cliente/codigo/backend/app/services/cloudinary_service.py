import cloudinary
import cloudinary.uploader
from ..core.config import settings

# Configurar Cloudinary solo si no es mock
if settings.CLOUDINARY_CLOUD_NAME != "mock":
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )

class CloudinaryService:
    @staticmethod
    def upload_image(file, folder="el-zapatito/products"):
        if settings.CLOUDINARY_CLOUD_NAME == "mock":
            # Devolver una imagen de prueba realista de Unsplash si no hay Cloudinary configurado
            return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"
        try:
            upload_result = cloudinary.uploader.upload(file, folder=folder)
            return upload_result.get("secure_url")
        except Exception as e:
            print(f"Error al subir a Cloudinary: {e}")
            # Fallback en caso de error de conexión/credenciales
            return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"

    @staticmethod
    def delete_image(public_id):
        if settings.CLOUDINARY_CLOUD_NAME == "mock":
            return True
        try:
            cloudinary.uploader.destroy(public_id)
            return True
        except Exception as e:
            print(f"Error al eliminar de Cloudinary: {e}")
            return False
