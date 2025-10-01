'use client';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Category, Item } from '@/lib/types';
import ItemCard from './ItemCard';

interface CategorySectionProps {
  category: Category;
  items: Item[];
  onTogglePurchased: (id: string, purchased: boolean) => void;
  onDeleteItem: (id: string) => void;
  editMode: boolean;
}

export default function CategorySection({
  category,
  items,
  onTogglePurchased,
  onDeleteItem,
  editMode,
}: CategorySectionProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-medium text-gray-900 mb-4">{category.name}</h2>
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onTogglePurchased={onTogglePurchased}
              onDeleteItem={onDeleteItem}
              editMode={editMode}
            />
          ))}
        </ul>
      </SortableContext>
      {items.length === 0 && (
        <p className="text-gray-500 text-center py-4">Nenhum item nesta categoria</p>
      )}
    </div>
  );
}