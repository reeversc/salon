"use client";

import React, { useState, useMemo } from 'react';

interface Tip {
  id: number;
  tip: string;
  category: string;
}

interface Exercise {
  id: number;
  exercise: string;
  muscleGroup: string;
}

type Item = Tip | Exercise;

interface Message {
  text: string;
  isBot: boolean;
}

const MultiTipsSystem: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Type 'hair tips' for hairstyling tips, 'nutrition tips' for nutrition advice, or 'leg exercises' for leg workout ideas.", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [tableType, setTableType] = useState<'hair' | 'nutrition' | 'leg' | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Item | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    category: '',
    muscleGroup: ''
  });

  const hairTips: Tip[] = useMemo(() => [
    { id: 1, tip: "Use a heat protectant spray before styling with hot tools", category: "Protection" },
    { id: 2, tip: "Deep condition your hair once a week", category: "Maintenance" },
    { id: 3, tip: "Trim your hair every 6-8 weeks to prevent split ends", category: "Maintenance" },
    { id: 4, tip: "Avoid washing your hair every day to maintain natural oils", category: "Cleansing" },
    { id: 5, tip: "Use a wide-tooth comb to detangle wet hair", category: "Styling" },
    { id: 6, tip: "Apply hair masks regularly for extra nourishment", category: "Treatment" },
    { id: 7, tip: "Protect your hair while sleeping with a silk or satin pillowcase", category: "Protection" },
    { id: 8, tip: "Avoid tight hairstyles that can cause breakage", category: "Styling" },
    { id: 9, tip: "Use cool water for the final rinse to seal the hair cuticle", category: "Cleansing" },
    { id: 10, tip: "Massage your scalp regularly to stimulate blood flow", category: "Maintenance" },
  ], []);

  const nutritionTips: Tip[] = useMemo(() => [
    { id: 1, tip: "Eat a variety of colorful fruits and vegetables daily", category: "General" },
    { id: 2, tip: "Choose whole grains over refined grains", category: "Carbohydrates" },
    { id: 3, tip: "Include lean proteins in every meal", category: "Protein" },
    { id: 4, tip: "Stay hydrated by drinking water throughout the day", category: "Hydration" },
    { id: 5, tip: "Limit processed foods and added sugars", category: "General" },
    { id: 6, tip: "Include healthy fats like avocados and nuts in your diet", category: "Fats" },
    { id: 7, tip: "Practice portion control to maintain a healthy weight", category: "Weight Management" },
    { id: 8, tip: "Eat fermented foods for gut health", category: "Digestive Health" },
    { id: 9, tip: "Choose low-fat dairy or dairy alternatives fortified with calcium", category: "Calcium" },
    { id: 10, tip: "Include omega-3 rich foods like fatty fish in your diet", category: "Fats" },
  ], []);

  const legExercises: Exercise[] = useMemo(() => [
    { id: 1, exercise: "Squats", muscleGroup: "Quadriceps, Hamstrings, Glutes" },
    { id: 2, exercise: "Lunges", muscleGroup: "Quadriceps, Hamstrings, Glutes" },
    { id: 3, exercise: "Deadlifts", muscleGroup: "Hamstrings, Glutes, Lower Back" },
    { id: 4, exercise: "Leg Press", muscleGroup: "Quadriceps, Hamstrings, Glutes" },
    { id: 5, exercise: "Calf Raises", muscleGroup: "Calves" },
    { id: 6, exercise: "Leg Extensions", muscleGroup: "Quadriceps" },
    { id: 7, exercise: "Hamstring Curls", muscleGroup: "Hamstrings" },
    { id: 8, exercise: "Step-Ups", muscleGroup: "Quadriceps, Hamstrings, Glutes" },
    { id: 9, exercise: "Bulgarian Split Squats", muscleGroup: "Quadriceps, Hamstrings, Glutes" },
    { id: 10, exercise: "Glute Bridges", muscleGroup: "Glutes, Hamstrings" },
  ], []);

  const currentItems: (Tip | Exercise)[] = useMemo(() => {
    switch(tableType) {
      case 'hair':
        return hairTips;
      case 'nutrition':
        return nutritionTips;
      case 'leg':
        return legExercises;
      default:
        return [];
    }
  }, [tableType, hairTips, nutritionTips, legExercises]);

  const filteredItems = useMemo(() => {
    return currentItems.filter((item: Tip | Exercise) => {
      const matchesSearch = Object.values(item).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if ('category' in item) {
        return matchesSearch && (filters.category === '' || item.category === filters.category);
      } else if ('muscleGroup' in item) {
        return matchesSearch && (filters.muscleGroup === '' || item.muscleGroup.includes(filters.muscleGroup));
      }
      
      return false;
    });
  }, [currentItems, searchTerm, filters]);

  const sortedItems = useMemo(() => {
    let sortableItems = [...filteredItems];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredItems, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPageItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);

  const uniqueCategories = useMemo(() => {
    if (tableType === 'leg') {
      return Array.from(new Set(legExercises.flatMap(exercise => exercise.muscleGroup.split(', '))));
    } else {
      return Array.from(new Set(currentItems.filter((item): item is Tip => 'category' in item).map(item => item.category)));
    }
  }, [tableType, currentItems, legExercises]);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const requestSort = (key: keyof Item) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSend = () => {
    const lowerInput = input.trim().toLowerCase();
    if (lowerInput === 'hair tips') {
      setShowTable(true);
      setTableType('hair');
    } else if (lowerInput === 'nutrition tips') {
      setShowTable(true);
      setTableType('nutrition');
    } else if (lowerInput === 'leg exercises') {
      setShowTable(true);
      setTableType('leg');
    } else {
      setMessages(prev => [
        ...prev,
        { text: input, isBot: false },
        { text: "I'm sorry, I don't understand that command. Try 'hair tips' for hairstyling tips, 'nutrition tips' for nutrition advice, or 'leg exercises' for leg workout ideas.", isBot: true }
      ]);
    }
    setInput('');
    setCurrentPage(1);
    setSearchTerm('');
    setFilters({ category: '', muscleGroup: '' });
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white p-4">
      <div className="flex-grow overflow-auto mb-4 bg-gray-900 rounded-lg border border-gray-700 shadow-sm" style={{ minHeight: '0' }}>
        <div className="p-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg ${
                message.isBot 
                  ? 'bg-gray-800 text-gray-300' 
                  : 'bg-blue-600 text-white ml-auto'
              } max-w-[80%] break-words`}
            >
              {message.text}
            </div>
          ))}
        </div>
        {showTable && (
          <div className="mt-4 p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${tableType === 'leg' ? 'exercises' : 'tips'}...`}
                className="flex-grow px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name={tableType === 'leg' ? 'muscleGroup' : 'category'}
                value={tableType === 'leg' ? filters.muscleGroup : filters.category}
                onChange={handleFilterChange}
                className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All {tableType === 'leg' ? 'Muscle Groups' : 'Categories'}</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    {Object.keys(currentPageItems[0] || {}).map(key => (
                      <th 
                        key={key}
                        onClick={() => requestSort(key as keyof Item)}
                        className="p-2 text-left text-gray-300 font-medium cursor-pointer hover:bg-gray-700"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                        {sortConfig.key === key && (
                          <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentPageItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700">
                      {Object.values(item).map((value, index) => (
                        <td key={index} className="p-2">{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {currentPage} of {Math.ceil(sortedItems.length / itemsPerPage)}</span>
              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={indexOfLastItem >= sortedItems.length}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[5, 10, 15, 20].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      <div className="mt-auto">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-grow px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type 'hair tips', 'nutrition tips', or 'leg exercises'..."
          />
          <button 
            onClick={handleSend}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiTipsSystem;
