import argparse
import os
import numpy as np
from PIL import Image

def hex_to_rgb(hex_color):
    """Converts hex color string to (R, G, B) tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def apply_theme_mapping(img, dark_color, light_color, suppress_rg=False):
    """
    Maps image luminosity to a gradient between dark_color and light_color.
    Optionally suppresses red and green channels to avoid clashing colors.
    """
    # Convert to grayscale for luminosity
    gray_img = img.convert('L')
    gray_data = np.array(gray_img) / 255.0
    
    # Separate theme colors
    d_r, d_g, d_b = dark_color
    l_r, l_g, l_b = light_color
    
    # Interpolate colors based on luminosity
    # Result = DarkColor * (1 - L) + LightColor * L
    new_r = (d_r * (1 - gray_data) + l_r * gray_data).astype(np.uint8)
    new_g = (d_g * (1 - gray_data) + l_g * gray_data).astype(np.uint8)
    new_b = (d_b * (1 - gray_data) + l_b * gray_data).astype(np.uint8)
    
    if suppress_rg:
        # Heavily reduce red and green if they were strong in original?
        # Alternatively, just ensure the output fits the blue/beige/black theme.
        # The duotone mapping already effectively "removes" original colors.
        pass
        
    # Stack channels back
    res_data = np.stack([new_r, new_g, new_b], axis=2)
    return Image.fromarray(res_data)

def apply_outline_effect(img, dark_color, light_color, mode_name="dark"):
    """
    Applies an edge detection filter to create a technical 'outline' look,
    then maps the result to the theme colors.
    """
    from PIL import ImageFilter, ImageOps
    
    # Convert to grayscale
    gray_img = img.convert('L')
    
    # Find edges
    edges = gray_img.filter(ImageFilter.FIND_EDGES)
    
    # Invert the edge map?
    # By default, FIND_EDGES gives black background (0), white edges (255).
    # map_theme: 
    #   Pixel 0 -> dark_color
    #   Pixel 255 -> light_color
    
    if mode_name == "dark":
        # Dark Mode:
        # Background (Black) -> Dark Theme Color (e.g. Slate)
        # Edges (White) -> Light Theme Color (e.g. Blue)
        # Result: Blue lines on Slate background. (Correct)
        pass
    else:
        # Light Mode:
        # We want Dark lines on Light Background.
        # Background (Black) -> Light Theme Color (e.g. Beige)
        # Edges (White) -> Dark Theme Color (e.g. Blue)
        
        # So we simply swap our target colors for the mapping function
        dark_color, light_color = light_color, dark_color

    return apply_theme_mapping(edges, dark_color, light_color)

def apply_mixed_effect(img, dark_color, light_color, mode_name="dark", invert=False):
    """
    Combines the 'outline' (edges) with the 'standard' (filled) look.
    This creates a "shaded technical drawing" effect.
    """
    from PIL import ImageFilter, ImageChops, ImageOps
    
    # Invert image first if requested (for Light -> Dark conversion of base image)
    if invert:
        img = ImageOps.invert(img)
        
    # 1. Get the Standard "Filled" Version (Gradient Map)
    filled = apply_theme_mapping(img, dark_color, light_color)
    
    # 2. Get the Outline Version
    # We need the edges to be the "Ink" color.
    
    # Edge detection works best on original structure? 
    # Or inverted structure? 
    # If we inverted the image, edges are still edges.
    
    gray_img = img.convert('L') # Already inverted if requested
    edges = gray_img.filter(ImageFilter.FIND_EDGES)
    # Enhance edges for this mode to make them pop against fill
    edges = edges.filter(ImageFilter.SMOOTH_MORE) 
    
    # We want to overlay these edges onto the filled image.
    # The edges are currently White-on-Black (255=Edge).
    
    if mode_name == "dark":
        # Dark Mode: Fill is Dark->Light.
        # We want to ADD the edges (which should be Light Color).
        # Since edges are white (255) in 'edges' image, using them as mask for Light Color works.
        
        # Let's map edges to Black->LightColor
        edge_overlay = apply_theme_mapping(edges, hex_to_rgb("#000000"), light_color)
        
        # Composite: Screen blending (adds light)
        return ImageChops.lighter(filled, edge_overlay)
        
    else:
        # Light Mode: Fill is Light->Dark.
        # We want to BURN the edges (which should be Dark Color).
        
        # Map edges (0=Black, 255=White)
        # We want Edges (255) to be DarkColor.
        # Background (0) to be White (transparent-ish for multiply).
        
        edge_overlay = apply_theme_mapping(edges, hex_to_rgb("#FFFFFF"), dark_color)
        
        # Composite: Multiply blending (adds darkness)
        return ImageChops.multiply(filled, edge_overlay)

def main():
    parser = argparse.ArgumentParser(description="Convert an image to the 'Bit by Bit' website theme.")
    parser.add_argument("input", help="Path to input image")
    parser.add_argument("--output", "-o", help="Path to output image (default: theme_output.png)")
    parser.add_argument("--mode", "-m", choices=["dark", "light"], default="dark", 
                        help="Theme mode to apply: 'dark' (Black to Blue) or 'light' (Beige to Blue)")
    parser.add_argument("--suppress", "-s", action="store_true", 
                        help="Strongly suppress original red/green influence (already handled by duotone mapping)")
    parser.add_argument("--effect", "-e", choices=["standard", "outline", "mixed"], default="standard",
                        help="Effect type: 'standard' (Filled), 'outline' (Edges Only), or 'mixed' (Shaded Edges)")
    parser.add_argument("--invert", "-i", action="store_true", help="Invert image luminosity before processing (useful for Light->Dark conversion)")

    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: File '{args.input}' not found.")
        return

    # Theme Colors from BitbyBit CSS
    # Dark Mode: Dark Slate (#0D1117) -> Bright Blue (#58A6FF)
    # Light Mode: Beige (#E6E4DD) -> Deep Blue (#2A5D9C)
    
    theme_colors = {
        "dark": {
            "darkest": hex_to_rgb("#05080E"), # Updated Darkest Black/Blue from reference
            "lightest": hex_to_rgb("#58A6FF")  # Reference Bright Blue
        },
        "light": {
            "darkest": hex_to_rgb("#2A5D9C"), # Deep Blue for lines/contrast
            "lightest": hex_to_rgb("#E6E4DD")  # Beige Background
        }
    }

    print(f"Loading image: {args.input}...")
    try:
        img = Image.open(args.input).convert('RGB')
    except Exception as e:
        print(f"Error opening image: {e}")
        return

    colors = theme_colors[args.mode]
    print(f"Applying {args.mode} theme with {args.effect} effect...")
    
    # Pre-inversion handled inside mixed/standard logic or before call?
    # Standard logic:
    if args.effect == 'outline':
        # Outline handles inversion internally for Light Mode, but maybe user wants to invert input?
        # Usually outline doesn't care about input polarity for edges, but does for background color.
        # Current outline logic:
        # Dark Mode: Black BG, White Lines.
        # Light Mode: White BG, Dark Lines.
        result = apply_outline_effect(img, colors["darkest"], colors["lightest"], args.mode)
    elif args.effect == 'mixed':
        result = apply_mixed_effect(img, colors["darkest"], colors["lightest"], args.mode, args.invert)
    else:
        # Standard Effect
        if args.invert:
            from PIL import ImageOps
            img = ImageOps.invert(img)
            
        result = apply_theme_mapping(img, colors["darkest"], colors["lightest"], args.suppress)
    
    output_path = args.output if args.output else "theme_output.png"
    result.save(output_path)
    print(f"Success! Saved to {output_path}")

if __name__ == "__main__":
    main()
