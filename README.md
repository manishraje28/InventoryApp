# Kidswear Inventory App

A simple, offline-first stock tracking app for a small kidswear business.

## Features
- **Dashboard**: View total stock and list of items.
- **Add/Edit**: Easily add new stock or update existing items.
- **Quick Sell**: One-tap button to reduce stock quantity.
- **Search & Filter**: Find items by category, color, or age group.
- **Offline**: Data persists locally using SQLite.

## Tech Stack
- React Native (Expo)
- TypeScript
- SQLite (expo-sqlite)
- React Navigation

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the App**
   ```bash
   npx expo start
   ```

3. **Test on Device**
   - Download "Expo Go" app on your Android phone.
   - Scan the QR code shown in the terminal.

## Project Structure
- `src/database`: SQLite database setup and queries.
- `src/context`: Global state management.
- `src/screens`: UI screens (Dashboard, AddItem, ItemDetail).
- `src/components`: Reusable UI components.
- `src/types`: TypeScript definitions.

## Future Extensions
- **Cloud Sync**: Add Firebase or Supabase for multi-device support.
- **WhatsApp Integration**: Share stock list via WhatsApp.
- **Analytics**: Track sales history.
