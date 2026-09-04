# Как добавить качественные 3D модели

## Проблема
Я (AI) не могу скачивать файлы напрямую. Нужно чтобы ТЫ скачал модели и положил их в проект.

## Где скачать БЕСПЛАТНЫЕ модели с анимациями

### 1. Mixamo (ЛУЧШИЙ ВАРИАНТ)
URL: https://www.mixamo.com

**Инструкция:**
1. Зарегистрируйся (бесплатно)
2. Выбери персонажа (например "Y Bot")
3. Скачай в формате **FBX** с анимациями:
   - idle
   - walk
   - run
   - jump
4. Конвертируй FBX → GLB на https://anyconv.com/fbx-to-glb-converter/
5. Положи файлы в `client/public/models/character.glb`

### 2. Quaternius (CC0 - полностью бесплатно)
URL: https://quaternius.com/packs.html

**Пакеты:**
- Ultimate Animated Characters
- Ultimate Modular Characters

**Скачай:**
1. Пак персонажей
2. Пак пропсов (ящики, бочки)
3. Положи в `client/public/models/`

### 3. Kenney Assets
URL: https://kenney.nl/assets

**Бесплатные low-poly:**
- Character pack
- Props pack

### 4. Poly Pizza (бывший Google Poly)
URL: https://poly.pizza

**Фильтр:** CC0, GLB format

## Куда положить файлы

```
client/public/models/
├── character.glb          # Персонаж с анимациями
├── props/
│   ├── barrel.glb
│   ├── crate.glb
│   └── box.glb
└── buildings/
    └── house.glb
```

## После скачивания

1. Положи модели в `client/public/models/`
2. Скажи мне "модели готовы"
3. Я обновлю код для их загрузки
4. Добавлю анимации
5. Оптимизирую рендеринг

## Быстрый старт (5 минут)

1. Иди на https://www.mixamo.com
2. Выбери "Y Bot" character
3. Скачай с анимациями: idle, walk, run, jump
4. Положи в `client/public/models/character.glb`
5. Напиши мне "готово"

Я всё остальное сделаю сам!
