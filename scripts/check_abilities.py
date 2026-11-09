from PIL import Image

for s in [1, 5, 10, 15, 19]:
    f = f"valorant-shorts/scripts/debug_spectate/f_{s:02d}.jpg"
    im = Image.open(f)
    # Save crops: bottom-center (abilities: x=650..1270, y=940..1070)
    ab_crop = im.crop((650, 940, 1270, 1070))
    ab_crop.save(f"valorant-shorts/scripts/debug_spectate/ab_{s:02d}.jpg")
    
    # Bottom-left (health: x=50..350, y=980..1060)
    hp_crop = im.crop((50, 980, 350, 1060))
    hp_crop.save(f"valorant-shorts/scripts/debug_spectate/hp_{s:02d}.jpg")

    # Center-top (spectating banner: x=700..1220, y=100..250)
    spec_crop = im.crop((700, 100, 1220, 250))
    spec_crop.save(f"valorant-shorts/scripts/debug_spectate/spec_{s:02d}.jpg")

print("Crops saved.")

