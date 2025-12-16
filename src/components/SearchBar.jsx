import { useEffect, useState } from 'react';

export default function SearchBar({ onChange }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    onChange?.(value);
  }, [value, onChange]);

  return (
    <div className="search">
      <input
        type="search"
        placeholder="Поиск по названию или тегу"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <span className="hint">Введите теги через пробел</span>
    </div>
  );
}



