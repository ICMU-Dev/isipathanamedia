import { CONTACT_CATEGORIES, contactCategory } from '../../utils/contacts';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList, ComboboxTrigger } from '../motion/combobox';

const groups = [...new Set(CONTACT_CATEGORIES.map(category => category.group))];
const filter = (value, query, keywords) => [value, ...keywords].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());

export default function ContactCategoryPicker({ value, onChange, disabled = false, allowAll = false, ariaLabel = 'Category', className = '' }) {
  return <Combobox value={contactCategory(value) || 'all'} onValueChange={next => onChange(next === 'all' ? '' : next)} disabled={disabled} filter={filter} className={className}>
    <ComboboxTrigger className="h-11 min-w-0 border-theme-base bg-[var(--admin-bg)] text-theme-primary">
      <ComboboxInput aria-label={ariaLabel} placeholder="Search categories…" />
    </ComboboxTrigger>
    <ComboboxContent className="border-theme-base bg-[var(--admin-card-bg)] text-theme-primary shadow-xl">
      <ComboboxList ariaLabel="Contact categories" className="max-h-60">
        <ComboboxEmpty>No category found. Try a service, like “posters” or “transport”.</ComboboxEmpty>
        {allowAll && <ComboboxItem value="all" textValue="All categories">All categories</ComboboxItem>}
        {groups.map(group => <ComboboxGroup key={group}>
          <ComboboxLabel>{group}</ComboboxLabel>
          {CONTACT_CATEGORIES.filter(category => category.group === group).map(category => <ComboboxItem key={category.value} value={category.value} textValue={category.label} keywords={category.keywords} className="min-h-10">{category.label}</ComboboxItem>)}
        </ComboboxGroup>)}
      </ComboboxList>
    </ComboboxContent>
  </Combobox>;
}
