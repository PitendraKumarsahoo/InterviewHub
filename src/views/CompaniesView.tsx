import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Company } from '../types';

interface CompaniesViewProps {
  companies: Company[];
  onSelectCompany: (companyId: string) => void;
  onOpenSubmit: () => void;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({
  companies,
  onSelectCompany,
  onOpenSubmit,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  const types = ['All', 'Product', 'Service', 'Startup', 'Consulting', 'Government/PSU'];

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.description.toLowerCase().includes(search.toLowerCase()) ||
      company.category.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      selectedType === 'All' ||
      company.type.toLowerCase() === selectedType.toLowerCase() ||
      (selectedType === 'Government/PSU' && company.type.toLowerCase().includes('psu'));

    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Companies
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Explore verified company profiles and real interview questions from university drives.
          </p>
        </div>

        <button
          onClick={onOpenSubmit}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-all self-start sm:self-auto shrink-0 cursor-pointer"
        >
          Add Experience
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search companies by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs transition-all"
        />
      </div>

      {/* Filters: All, Product, Service, Startup, Consulting, Government/PSU */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-xs font-semibold text-slate-500 mr-1">Sector:</span>
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
              selectedType === type
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs sm:text-sm">
            No companies found matching your criteria.
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div
              key={company.id}
              onClick={() => onSelectCompany(company.id)}
              className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm group-hover:bg-indigo-600 transition-colors shadow-2xs">
                    {company.name.charAt(0)}
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 text-slate-600">
                    {company.type}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {company.name}
                </h3>
                <span className="text-xs text-slate-500 block mb-2 font-medium">
                  {company.type} · {company.category}
                </span>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {company.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="font-medium text-slate-700">{company.experienceCount} Experiences</span>
                <span>{company.questionCount} Questions</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
