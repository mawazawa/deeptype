#!/bin/bash

# Load environment variables
source .env.local

# Apply migrations
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DATABASE -f supabase/migrations/20240218_user_profiles.sql

# Verify tables were created
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DATABASE -c "\dt"