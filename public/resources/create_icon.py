from PIL import Image, ImageDraw, ImageFont
import os

def create_setharkk_icon():
    # Créer une image carrée avec fond transparent
    size = 256
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Dessiner un cercle bleu
    margin = 10
    draw.ellipse([margin, margin, size-margin, size-margin], 
                 fill=(41, 128, 185, 255))  # Bleu
    
    # Ajouter le texte "S"
    font_size = 150
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    # Centrer le texte
    text = "S"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    # Dessiner le texte en blanc
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    
    # Sauvegarder en différentes tailles
    sizes = [16, 32, 48, 128, 256]
    for s in sizes:
        resized = image.resize((s, s), Image.Resampling.LANCZOS)
        resized.save(f'setharkk_{s}x{s}.png')
    
    # Sauvegarder en ICO (inclut toutes les tailles)
    image.save('setharkk.ico', format='ICO', sizes=[(s, s) for s in sizes])

if __name__ == '__main__':
    create_setharkk_icon() 