# Luminar Storage Buckets Setup

## Required Storage Buckets

The Luminar application requires two public storage buckets:

### 1. `chapters/` bucket (public)
- **Purpose**: Store clue images for each chapter
- **Structure**: `chapters/{chapter_id}/clue-{n}.png`
- **Example**: `chapters/1/clue-1.png`, `chapters/1/clue-2.png`, `chapters/1/clue-3.png`

### 2. `packs/` bucket (public)  
- **Purpose**: Store chapter pack JSON files for transparency
- **Structure**: `packs/chapter-{id}-pack.json`
- **Example**: `packs/chapter-1-pack.json`

## Setup Instructions

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Storage > Buckets
3. Click "Create Bucket"
4. Create bucket named `chapters` with public access enabled
5. Create bucket named `packs` with public access enabled

### Option 2: Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref hyxrwjltaxmlnqxkhyxj

# Create buckets
supabase storage create-bucket chapters --public
supabase storage create-bucket packs --public
```

### Option 3: Supabase Management API
```bash
# Create chapters bucket
curl -X POST 'https://api.supabase.com/v1/projects/hyxrwjltaxmlnqxkhyxj/storage/buckets' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"name": "chapters", "public": true}'

# Create packs bucket  
curl -X POST 'https://api.supabase.com/v1/projects/hyxrwjltaxmlnqxkhyxj/storage/buckets' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"name": "packs", "public": true}'
```

## Verification

After creating the buckets, verify they exist by:
1. Checking the Supabase dashboard Storage section
2. Or running: `supabase storage list-buckets`

## Next Steps

Once buckets are created:
1. Upload clue images to `chapters/1/` directory
2. The application will automatically generate chapter pack JSON files in `packs/` when chapters end
