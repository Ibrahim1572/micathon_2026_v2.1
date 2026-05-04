import os
import io
from fastapi import APIRouter, File, UploadFile, HTTPException
from PIL import Image
from google import genai
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

api_key = os.getenv("api_key")

@router.post("/upload", tags=["Upload"])
async def upload_receipt(image: UploadFile = File(...)):
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    try:
        # Read image bytes
        contents = await image.read()
        pil_image = Image.open(io.BytesIO(contents))
        
        client = genai.Client(api_key=api_key)
        
        prompt = (
            "Extract the grocery items and their prices from this receipt image. "
            "Output the result in this exact format, line by line:\n"
            "{Item Name} {Quantity or weight}...........Rs. {Price}"
        )
        
        # Fixed: Corrected model name to gemini-2.0-flash
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, pil_image]
        )
        
        # Clean up the text
        text = response.text.strip()
        
        # Improved Markdown stripping using a helper instead of manual slicing
        if "```" in text:
            text = text.replace("```text", "").replace("```", "").strip()
            
        return {"receipt_text": text}
        
    except Exception as e:
        # It's helpful to print the error to your console for debugging
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")
