import React, { useState } from 'react';
import { Search, Building2, ChevronRight, Layers, HelpCircle, FileText, Filter } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  const categories = [
    'All',
    'Software Engineering',
    'Data Analytics',
    'AI/ML',
    'Cloud',
    'Consulting',
  ];

  const types = ['All', 'Service', 'Product', 'Startup', 'Consulting'];

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      company.category.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesType =
      selectedType === 'All' ||
      company.type.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Companies
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Browse real campus &amp; off-campus interview experiences across service, product, and startup companies
          </p>
        </div>

        <button
          onClick={onOpenSubmit}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all self-start sm:self-auto shrink-0"
        >
          + Add Company Experience
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search company by name, description, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-xs sm:text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1">Type:</span>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedType === t
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No companies match your filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your search query or submit the first interview experience for this company.
          </p>
          <button
            onClick={onOpenSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            + Add Company
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              onClick={() => onSelectCompany(company.id)}
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base group-hover:bg-indigo-600 transition-colors shadow-2xs">
                    {company.name.charAt(0)}
                  </div>
                  <div className="flex gap-1.5">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {company.type}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {company.name}
                </h3>
                <span className="text-xs text-indigo-600 font-medium block mb-2">
                  {company.category}
                </span>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {company.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {company.experienceCount} Experiences
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    {company.questionCount} Questions
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
