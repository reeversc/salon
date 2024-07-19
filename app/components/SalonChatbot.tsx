"use client";

import React, { useState, useMemo } from 'react';

interface Client {
  name: string;
  service: string;
  price: number;
  date: string;
}

interface Message {
  text: string;
  isBot: boolean;
}

const SalonChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Welcome to the Salon Client Info System. Type 'show clients' to see the client table.", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Client | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    service: '',
    dateStart: '',
    dateEnd: ''
  });

  const parseCSVData = (csvString: string): Client[] => {
    const lines = csvString.trim().split('\n');
    return lines.map(line => {
      const [lastName, firstName, service, price, date] = line.split(',');
      return {
        name: `${firstName} ${lastName}`,
        service,
        price: parseFloat(price.replace('$', '')),
        date
      };
    });
  };

  const allClients = useMemo(() => {
    const csvData = `Collier,Amber,mullet,$25.00,2023-12-04
Colon,Devyn,fdclipper,$0.00,2023-12-04
Haske,Toddy,shrtcut,$69.00,2023-12-04
Johnson,Leah,lngcrlcut,$107.00,2023-12-04
Johnson,Leah,cut4,$88.00,2023-12-04
Anderson,Kara,lngcrlcut,$107.00,2024-05-24`;
    return parseCSVData(csvData);
  }, []);

  const filteredClients = useMemo(() => {
    return allClients.filter(client => {
      const matchesSearch = Object.values(client).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesService = filters.service === '' || client.service === filters.service;
      const matchesDate = 
        (filters.dateStart === '' || client.date >= filters.dateStart) &&
        (filters.dateEnd === '' || client.date <= filters.dateEnd);

      return matchesSearch && matchesService && matchesDate;
    });
  }, [allClients, searchTerm, filters]);

  const sortedClients = useMemo(() => {
    let sortableClients = [...filteredClients];
    if (sortConfig.key !== null) {
      sortableClients.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableClients;
  }, [filteredClients, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClients = sortedClients.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const requestSort = (key: keyof Client) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSend = () => {
    if (input.trim().toLowerCase() === 'show clients') {
      setShowTable(true);
      setMessages(prev => [...prev, { text: "Here's the client table:", isBot: true }]);
    } else {
      setMessages(prev => [
        ...prev,
        { text: input, isBot: false },
        { text: "I'm sorry, I don't understand that command. Type 'show clients' to see the client table.", isBot: true }
      ]);
    }
    setInput('');
  };

  const uniqueServices = useMemo(() => Array.from(new Set(allClients.map(client => client.service))), [allClients]);

  return (
    <div className="flex flex-col h-screen bg-black text-white p-4">
      <div className="flex-grow overflow-auto mb-4 bg-gray-900 rounded-lg border border-gray-700 shadow-sm">
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
                placeholder="Search clients..."
                className="flex-grow px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="service"
                value={filters.service}
                onChange={handleFilterChange}
                className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Services</option>
                {uniqueServices.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
              <input
                type="date"
                name="dateStart"
                value={filters.dateStart}
                onChange={handleFilterChange}
                className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                name="dateEnd"
                value={filters.dateEnd}
                onChange={handleFilterChange}
                className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    {Object.keys(currentClients[0] || {}).map(key => (
                      <th 
                        key={key}
                        onClick={() => requestSort(key as keyof Client)}
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
                  {currentClients.map((client, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                      {Object.values(client).map((value, cellIndex) => (
                        <td key={cellIndex} className="p-2">
                          {cellIndex === 2 ? `$${value.toFixed(2)}` : value}
                        </td>
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
              <span>Page {currentPage} of {Math.ceil(sortedClients.length / itemsPerPage)}</span>
              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={indexOfLastItem >= sortedClients.length}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-grow px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type 'show clients'..."
        />
        <button 
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default SalonChatbot;
