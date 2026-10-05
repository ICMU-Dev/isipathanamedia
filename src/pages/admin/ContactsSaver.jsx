import { createElement, useEffect, useId, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BookUser, Building2, Check, ChevronLeft, ChevronRight, Copy, Grid2X2, List, ListChecks, LoaderCircle, Mail, MapPin, MessageCircle, Phone, Plus, RefreshCw, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '../../context/AuthContext';
import { isAdmin } from '../../utils/roles';
import { CONTACT_CATEGORIES, CONTACT_LIMITS, EMPTY_CONTACT, MAX_CONTACT_PHONES, contactActions, contactCategory, contactErrorMessage, contactPhones, normalizeContactPhone, normalizeMapUrl, prepareContact } from '../../utils/contacts';
import { CONTACT_PAGE_SIZE, deleteContact, fetchContacts, saveContact } from '../../lib/api/contactsApi';

import { motion as Motion, useReducedMotion } from 'motion/react';
import { Tabs, TabsList, TabsTrigger } from '../../components/motion/tabs';
import ContactCategoryPicker from '../../components/admin/ContactCategoryPicker';
import ContactActionMenu from '../../components/admin/ContactActionMenu';
import useContactPress from '../../components/admin/useContactPress';
import { MorphingModal } from '../../components/motion/morphing-modal';
import { Drawer } from '../../components/motion/drawer';

const inputClass = 'w-full rounded-xl border border-theme-base bg-[var(--admin-bg)] px-3 py-2.5 text-sm text-theme-primary outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50';
const buttonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-theme-base px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--admin-border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50';
const primaryClass = `${buttonClass} bg-[var(--accent)] text-[var(--accent-text,#000)] hover:opacity-90 active:scale-[0.97] motion-reduce:transform-none transition-transform`;
const toneClass = 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]';

function ContactDialog({ title, children, onClose, busy = false, drawer = false, actions, hero = false }) {
  const titleId = useId();
  const content = <>
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 id={titleId} className={hero ? 'text-xs font-medium opacity-50' : 'text-lg font-semibold'}>{title}</h2>
      <div className="-mr-2 flex items-center">{actions}<button data-modal-close type="button" className="flex h-11 w-11 items-center justify-center rounded-full opacity-60 hover:bg-[var(--admin-border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-30" onClick={onClose} disabled={busy} aria-label="Close dialog"><X size={18} /></button></div>
    </div>
    {children}
  </>;
  return drawer ? <Drawer open onOpenChange={open => { if (!open) onClose(); }} ariaLabelledby={titleId} busy={busy}>{content}</Drawer>
    : <MorphingModal native viewId={title} onClose={onClose} ariaLabelledby={titleId} busy={busy}>{content}</MorphingModal>;
}

function ContactPhoneFields({ rows, errors, touched, onTouch, onChange, onRemove }) {
  return <div className="space-y-2">
    {rows.map((item, index) => {
      const key = index ? `phone_${index}` : 'phone';
      const error = touched[key] && errors[key];
      return <div key={index}>
        <div className="flex items-center gap-1.5">
          <Phone size={16} aria-hidden="true" className="shrink-0 opacity-40" />
          <label htmlFor={index ? `contact-phone-${index}` : 'contact-phone'} className="sr-only">{index ? `Phone ${index + 1}` : 'Phone'}</label>
          <input id={index ? `contact-phone-${index}` : 'contact-phone'} type="tel" autoComplete="tel" maxLength={40} className={inputClass + ' min-w-0 flex-1'} value={item.phone} placeholder={index ? 'Another number' : '077 123 4567'} onChange={event => onChange(index, { phone: event.target.value, ...(!event.target.value.trim() ? { whatsapp_enabled: false } : {}) })} onBlur={() => { const phone = normalizeContactPhone(item.phone); if (phone) onChange(index, { phone }); onTouch(key); }} aria-invalid={Boolean(error)} aria-describedby={error ? `phone-error-${index}` : 'contact-phone-hint'} />
          <button type="button" aria-label={`WhatsApp for phone ${index + 1}`} aria-pressed={item.whatsapp_enabled} title="Mark this number as available on WhatsApp" disabled={!normalizeContactPhone(item.phone)} onClick={() => onChange(index, { whatsapp_enabled: !item.whatsapp_enabled })} className="flex h-11 w-9 shrink-0 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-30"><span className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${item.whatsapp_enabled ? toneClass : 'bg-[var(--admin-border)] opacity-50'}`}><MessageCircle size={14} /></span></button>
          <button type="button" aria-label={rows.length === 1 ? 'Remove phone' : `Remove phone ${index + 1}`} className="flex h-11 w-6 shrink-0 items-center justify-center opacity-40 hover:opacity-100" onClick={() => onRemove(index)}><X size={14} /></button>
        </div>
        {error && <p id={`phone-error-${index}`} className="ml-6 mt-1 text-xs text-red-500">{error}</p>}
      </div>;
    })}
    <p id="contact-phone-hint" className="ml-6 text-[10px] leading-relaxed opacity-55">Sri Lankan numbers get +94 automatically. For overseas numbers, include + and the country code. Tap the chat icon for WhatsApp.</p>
  </div>;
}

function ContactForm({ contact, onClose, onSaved }) {
  const [values, setValues] = useState(() => ({ ...EMPTY_CONTACT, ...Object.fromEntries(Object.entries(contact || {}).map(([key, value]) => [key, value ?? ''])), category: contactCategory(contact?.category || EMPTY_CONTACT.category) }));
  const [fields, setFields] = useState(() => {
    const existing = ['phone', 'email', 'map_url', 'location'].filter(key => contact?.[key]);
    return existing.length ? existing : ['phone'];
  });
  const [menuContainer, setMenuContainer] = useState(null);
  const [touched, setTouched] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const addButton = useRef(null);
  const pendingField = useRef(null);
  const { errors } = prepareContact(values);
  const valid = Object.keys(errors).length === 0;
  const methods = [
    { key: 'phone', label: 'Phone', Icon: Phone, type: 'tel', placeholder: '077 123 4567', autocomplete: 'tel' },
    { key: 'email', label: 'Email', Icon: Mail, type: 'email', placeholder: 'hello@example.com', autocomplete: 'email' },
    { key: 'map_url', label: 'Map link', Icon: MapPin, type: 'url', placeholder: 'Paste a map link' },
    { key: 'location', label: 'Address', Icon: Building2, placeholder: 'Street, city or area', autocomplete: 'street-address' },
  ];
  const change = (key, value) => {
    setValues(previous => ({ ...previous, [key]: value, ...(key === 'phone' && !value.trim() ? { whatsapp_enabled: false } : {}) }));
    setSaveError('');
  };
  const addField = key => {
    if (key === 'phone' && fields.includes('phone')) {
      setValues(previous => ({ ...previous, additional_phones: [...previous.additional_phones, { phone: '', whatsapp_enabled: false }] }));
    } else setFields(previous => [...previous, key]);
    requestAnimationFrame(() => document.getElementById(key === 'phone' && fields.includes('phone') ? `contact-phone-${values.additional_phones.length + 1}` : `contact-${key}`)?.focus());
  };
  const removeField = key => {
    change(key, '');
    setFields(previous => previous.filter(field => field !== key));
    addButton.current?.focus();
  };
  const phoneRows = [{ phone: values.phone, whatsapp_enabled: values.whatsapp_enabled }, ...values.additional_phones];
  const updatePhone = (index, updates) => {
    setValues(previous => index === 0 ? { ...previous, ...updates } : { ...previous, additional_phones: previous.additional_phones.map((item, position) => position === index - 1 ? { ...item, ...updates } : item) });
    setSaveError('');
  };
  const removePhone = index => {
    if (phoneRows.length === 1) { removeField('phone'); return; }
    const remaining = phoneRows.filter((_, position) => position !== index);
    setValues(previous => ({ ...previous, ...remaining[0], additional_phones: remaining.slice(1) }));
  };
  const availableMethods = methods.filter(method => method.key === 'phone' ? !fields.includes('phone') || phoneRows.length < MAX_CONTACT_PHONES : !fields.includes(method.key));
  const submit = async event => {
    event.preventDefault();
    if (submitting.current || !valid) return;
    submitting.current = true;
    setSaving(true);
    try {
      await saveContact(values, contact);
      toast.success(contact ? 'Contact updated.' : 'Contact saved for the team.');
      onSaved();
    } catch (error) {
      setSaveError(contactErrorMessage(error));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  return (
    <ContactDialog title={contact ? 'Edit contact' : 'Add contact'} onClose={onClose} busy={saving}>
      <form onSubmit={submit} noValidate>
        <fieldset disabled={saving} className="space-y-4">
          <div>
            <label htmlFor="contact-name" className="mb-1.5 block text-xs font-medium opacity-65">Name <span aria-hidden="true">*</span></label>
            <input id="contact-name" data-autofocus className={inputClass} value={values.name} onChange={event => change('name', event.target.value)} onBlur={() => setTouched(previous => ({ ...previous, name: true }))} maxLength={120} autoFocus required autoComplete="organization" placeholder="e.g. City Print Studio" aria-invalid={Boolean(touched.name && errors.name)} aria-describedby={touched.name && errors.name ? 'contact-name-error' : undefined} />
            {touched.name && errors.name && <p id="contact-name-error" className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-medium opacity-65">Category <span aria-hidden="true">*</span></span>
            <ContactCategoryPicker value={values.category} onChange={value => change('category', value)} disabled={saving} />
          </div>
          <div className="border-t border-theme-base pt-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium opacity-65">Contact details <span aria-hidden="true">*</span></span>
              <DropdownMenu.Root modal={false} onOpenChange={open => {
                if (open) {
                  // Stay in the native dialog's top layer, outside its scrolling panel.
                  setMenuContainer(addButton.current?.closest('dialog') || document.body);
                  pendingField.current = null;
                }
              }}>
                <DropdownMenu.Trigger ref={addButton} type="button" aria-label="Add contact detail" disabled={saving || !availableMethods.length} className={buttonClass + ' !rounded-full !px-3 ' + toneClass}><Plus size={16} /></DropdownMenu.Trigger>
                <DropdownMenu.Portal container={menuContainer}>
                  <DropdownMenu.Content align="end" sideOffset={8} collisionPadding={16}
                    className="contact-menu-surface z-[350] w-48 max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto overscroll-contain rounded-2xl p-1.5 outline-none data-[state=open]:animate-in data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 duration-150 motion-reduce:animate-none"
                    onCloseAutoFocus={event => {
                      if (pendingField.current) {
                        event.preventDefault();
                        const key = pendingField.current;
                        pendingField.current = null;
                        addField(key);
                      }
                    }}>
                    {availableMethods.map(({ key, label, Icon }) => <DropdownMenu.Item key={key} disabled={saving} onSelect={() => { pendingField.current = key; }} className="flex min-h-11 cursor-default select-none items-center gap-3 rounded-xl px-3 text-sm outline-none focus:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] data-[disabled]:opacity-40">{createElement(Icon, { size: 16, className: 'opacity-60', 'aria-hidden': true })}{label}</DropdownMenu.Item>)}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
            <div className="space-y-3">
              {fields.map(key => {
                if (key === 'phone') return <ContactPhoneFields key={key} rows={phoneRows} errors={errors} touched={touched} onTouch={key => setTouched(previous => ({ ...previous, [key]: true }))} onChange={updatePhone} onRemove={removePhone} />;
                const method = methods.find(item => item.key === key);
                const Icon = method.Icon;
                const showError = touched[key] && values[key] && errors[key];
                return <div key={key}>
                  <div className="flex items-center gap-2">
                    <Icon size={17} aria-hidden="true" className="shrink-0 opacity-45" />
                    <label htmlFor={`contact-${key}`} className="sr-only">{method.label}</label>
                    <input id={`contact-${key}`} className={inputClass + ' min-w-0 flex-1'} type={method.type || 'text'} value={values[key]} placeholder={method.placeholder} maxLength={CONTACT_LIMITS[key] || 40} autoComplete={method.autocomplete || 'off'} onChange={event => change(key, event.target.value)} onBlur={() => setTouched(previous => ({ ...previous, [key]: true }))} aria-invalid={Boolean(showError)} aria-describedby={showError ? `contact-${key}-error` : undefined} />
                    <button type="button" className={buttonClass + ' !border-0 !px-2 opacity-45'} aria-label={`Remove ${method.label.toLowerCase()}`} onClick={() => removeField(key)}><X size={15} /></button>
                  </div>
                  {showError && <p id={`contact-${key}-error`} className="ml-6 mt-1 text-xs text-red-500">{errors[key]}</p>}
                </div>;
              })}
            </div>
            <p id="contact-required-hint" className="mt-3 text-xs opacity-45">Add at least one phone, email, map link, or address.</p>
          </div>
        </fieldset>
        {saveError && <p role="alert" className="mt-4 text-sm text-red-500">{saveError}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button data-modal-close type="button" onClick={onClose} disabled={saving} className={buttonClass}>Cancel</button>
          <button type="submit" disabled={saving || !valid} aria-describedby={!valid ? 'contact-required-hint' : undefined} className={primaryClass}>{saving && <LoaderCircle size={16} className="animate-spin" />}{saving ? 'Saving…' : 'Save contact'}</button>
        </div>
      </form>
    </ContactDialog>
  );
}
const categoryColors = ['#a78bfa', '#60a5fa', '#38bdf8', '#fbbf24', '#fb923c', '#e879f9', '#34d399', '#fb7185', '#94a3b8'];
const contactMethods = [
  { value: '', label: 'All', Icon: BookUser },
  { value: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle },
  { value: 'phone', label: 'Phone', Icon: Phone },
  { value: 'email', label: 'Email', Icon: Mail },
];
function contactLinks(contact) {
  const actions = contactActions(contact);
  return [
    { href: actions.call, label: `Call ${contact.name}`, Icon: Phone, color: 'text-[var(--accent)]' },
    { href: actions.whatsapp, label: `WhatsApp ${contact.name}`, Icon: MessageCircle, external: true, color: 'text-emerald-500' },
    { href: actions.email, label: `Email ${contact.name}`, Icon: Mail, color: 'text-sky-500' },
    { href: normalizeMapUrl(contact.map_url), label: `Map for ${contact.name}`, Icon: MapPin, external: true, color: 'text-violet-400' },
  ].filter(action => action.href);
}
function ContactQuickActions({ contact, compact = false, labels = false, onView }) {
  const phones = contactPhones(contact);
  const multiple = phones.length > 1;
  const links = contactLinks(contact).filter(link => !multiple || ![Phone, MessageCircle].includes(link.Icon));
  return <div className={`flex shrink-0 items-center ${labels ? 'justify-center gap-3' : 'gap-0.5'}`}>
    {multiple && onView && <button type="button" aria-label={`Choose a number for ${contact.name}`} onClick={() => onView(contact)} className="flex h-11 min-w-11 items-center justify-center rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"><span className={`flex h-8 items-center gap-1 rounded-full px-2 ${toneClass}`}><Phone size={14} /><span className="text-[10px]">{phones.length}</span></span></button>}
    {(compact ? multiple ? [] : links.slice(0, 1) : links).map(({ href, label, Icon, external }) => <a key={label} href={href} aria-label={label} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1.5 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] active:scale-95 motion-reduce:transform-none transition-transform">
      <span className={`flex items-center justify-center rounded-full ${toneClass} transition-colors hover:bg-[var(--admin-border)] ${labels ? 'h-11 w-11' : 'h-8 w-8'}`}>{createElement(Icon, { size: labels ? 18 : 15 })}</span>
      {labels && <span className="text-[10px] text-theme-primary opacity-65">{label.split(' ')[0]}</span>}
    </a>)}
  </div>;
}
function ContactSelection({ contact, selected, onSelect, className = '' }) {
  return <label data-contact-actions className={`relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center ${className}`}>
    <input type="checkbox" aria-label={`Select ${contact.name}`} checked={selected} onChange={() => onSelect(contact)} className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0" />
    <span className={`pointer-events-none flex h-6 w-6 items-center justify-center rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--admin-bg)] ${selected ? 'border-transparent bg-[var(--accent)] text-[var(--accent-text,#000)]' : 'border-current opacity-40'}`}>{selected && <Check size={15} />}</span>
  </label>;
}
function ContactRow({ contact, onView, onEdit, onDelete, onCopy, selecting, selected, onSelect }) {
  const press = useContactPress(() => onSelect(contact));
  const reduce = useReducedMotion();
  const index = Math.max(0, CONTACT_CATEGORIES.findIndex(item => item.value === contactCategory(contact.category)));
  const color = categoryColors[index % categoryColors.length];
  const initials = contact.name.trim().split(/\s+/).slice(0, 2).map(word => [...word][0]).join('').toLocaleUpperCase();
  return <Motion.article {...press} initial={{ x: reduce ? 0 : 12 }} animate={{ x: 0 }} transition={{ duration: reduce ? 0 : 0.22 }} className={`flex min-w-0 select-none items-center gap-1 px-2 py-2 transition-colors [-webkit-touch-callout:none] ${selected ? 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]' : ''}`}>
    {selecting && <ContactSelection contact={contact} selected={selected} onSelect={onSelect} />}
    <button type="button" aria-label={contact.name} onClick={() => selecting ? onSelect(contact) : onView(contact)} className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl p-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]">
      {!selecting && <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold" style={{ color, backgroundColor: `${color}20` }}>{initials}</span>}
      <span className="min-w-0"><span className="block truncate text-[13px] font-medium">{contact.name}</span><span className="mt-0.5 block truncate text-[10px] opacity-50">{CONTACT_CATEGORIES[index].label}</span></span>
    </button>
    {!selecting && <div data-contact-actions className="flex items-center"><ContactQuickActions contact={contact} compact onView={onView} /><ContactActionMenu contact={contact} onView={onView} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy} onSelect={onSelect} /></div>}
  </Motion.article>;
}
function ContactCard({ contact, onEdit, onDelete, onView, onCopy, layout, selecting, selected, onSelect }) {
  const press = useContactPress(() => onSelect(contact));
  const category = CONTACT_CATEGORIES.find(item => item.value === contactCategory(contact.category))?.label || 'Other services';
  const color = categoryColors[Math.max(0, CONTACT_CATEGORIES.findIndex(item => item.value === contactCategory(contact.category))) % categoryColors.length];
  const initials = contact.name.trim().split(/\s+/).slice(0, 2).map(word => [...word][0]).join('').toLocaleUpperCase();
  const list = layout === 'list';
  return (
    <article {...press} className={`group flex min-w-0 select-none rounded-2xl border border-theme-base bg-[var(--admin-card-bg)] p-5 transition-shadow hover:shadow-lg hover:shadow-black/5 [-webkit-touch-callout:none] ${selected ? 'ring-2 ring-[var(--accent)]' : ''} ${list ? 'flex-col gap-4 sm:flex-row sm:items-center' : 'flex-col'}`}>
      <div className={`flex min-w-0 items-start gap-3 ${list ? 'flex-1' : 'mb-4'}`}>
        <div className="relative h-11 w-11 shrink-0">
          <div aria-hidden="true" className={`flex h-full w-full items-center justify-center rounded-2xl text-sm font-semibold ${selecting ? 'invisible' : 'group-hover:invisible group-focus-within:invisible'}`} style={{ color, backgroundColor: `${color}18` }}>{initials}</div>
          <div className={`absolute inset-0 ${selecting ? '' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`}><ContactSelection contact={contact} selected={selected} onSelect={onSelect} /></div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-base font-semibold"><button type="button" onClick={() => selecting ? onSelect(contact) : onView(contact)} className="text-left hover:underline focus-visible:outline focus-visible:outline-[var(--accent)]">{contact.name}</button></h2>
          <p className="mt-1 truncate text-xs opacity-55">{contact.contact_person || category}</p>
        </div>
        {!list && !selecting && <div data-contact-actions className="-mr-2 -mt-2"><ContactActionMenu contact={contact} onView={onView} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy} onSelect={onSelect} /></div>}
      </div>
      <div className={`space-y-2 text-xs opacity-65 ${list ? 'min-w-0 flex-1' : 'mb-4'}`}>
        {contact.phone && <p className="flex items-start gap-2"><Phone size={15} className="mt-0.5 shrink-0 opacity-60" /><span className="break-all">{contact.phone}</span></p>}
        {contact.email && <p className="flex items-start gap-2"><Mail size={15} className="mt-0.5 shrink-0 opacity-60" /><span className="break-all">{contact.email}</span></p>}
        {contact.location && <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 opacity-60" /><span className="break-words">{contact.location}</span></p>}
      </div>
      {!selecting && <div data-contact-actions className={`flex flex-wrap items-center gap-1.5 ${list ? 'sm:justify-end' : 'mt-auto border-t border-theme-base pt-3'}`}>
        <ContactQuickActions contact={contact} onView={onView} />
        {list && <ContactActionMenu contact={contact} onView={onView} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy} onSelect={onSelect} />}
      </div>}
    </article>
  );
}

function ContactDirectory({ onSignInAgain }) {
  const [filters, setFilters] = useState({ search: '', category: '', channel: '', sort: 'name', page: 0 });
  const [layout, setLayout] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [result, setResult] = useState({ contacts: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [bulkRemoving, setBulkRemoving] = useState(null);
  const [bulkError, setBulkError] = useState('');
  const deleteLock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const next = await fetchContacts({ ...filters, signal: controller.signal });
        if (!controller.signal.aborted) {
          if (!next.contacts.length && filters.page > 0) {
            setFilters(previous => ({ ...previous, page: Math.max(0, Math.ceil(next.count / CONTACT_PAGE_SIZE) - 1) }));
          } else {
            setResult(next);
            setError('');
            setAccessDenied(false);
            setLoading(false);
          }
        }
      } catch (failure) {
        if (!controller.signal.aborted) {
          setResult({ contacts: [], count: 0 });
          setError(contactErrorMessage(failure));
          setAccessDenied(failure?.code === '42501' || failure?.code === 'PGRST301');
          setLoading(false);
        }
      }
    }, filters.search ? 300 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [filters, revision]);
  const clearSelection = () => { setSelecting(false); setSelected(new Set()); };
  const refresh = () => { clearSelection(); setLoading(true); setRevision(previous => previous + 1); };
  const filter = updates => { clearSelection(); setLoading(true); setFilters(previous => ({ ...previous, page: 0, ...updates })); };
  const selectContact = contact => {
    setSelecting(true);
    setSelected(previous => {
      const next = new Set(previous);
      if (next.has(contact.id)) next.delete(contact.id); else next.add(contact.id);
      return next;
    });
  };
  const selectedContacts = result.contacts.filter(contact => selected.has(contact.id));
  const allSelected = result.contacts.length > 0 && selectedContacts.length === result.contacts.length;
  const selectPage = () => setSelected(allSelected ? new Set() : new Set(result.contacts.map(contact => contact.id)));
  const remove = async () => {
    if (deleteLock.current) return;
    deleteLock.current = true;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteContact(removing);
      toast.success('Contact deleted.');
      setRemoving(null);
      refresh();
    } catch (failure) { setDeleteError(contactErrorMessage(failure)); }
    finally { deleteLock.current = false; setDeleting(false); }
  };
  const removeSelected = async () => {
    if (deleteLock.current || !bulkRemoving?.length) return;
    deleteLock.current = true;
    setDeleting(true);
    setBulkError('');
    const failed = [];
    const deleted = new Set();
    try {
      // Reuse each record's permission and last-updated checks; never delete by an unchecked list of IDs.
      for (const contact of bulkRemoving) {
        try { await deleteContact(contact); deleted.add(contact.id); }
        catch (failure) { failed.push({ contact, failure }); }
      }
      if (deleted.size) {
        setResult(previous => ({ contacts: previous.contacts.filter(contact => !deleted.has(contact.id)), count: Math.max(0, previous.count - deleted.size) }));
        setSelected(previous => new Set([...previous].filter(id => !deleted.has(id))));
        toast.success(`${deleted.size} ${deleted.size === 1 ? 'contact' : 'contacts'} deleted.`);
      }
      if (failed.length) {
        setBulkRemoving(failed.map(item => item.contact));
        setBulkError(`${failed.length} ${failed.length === 1 ? 'contact was' : 'contacts were'} not deleted. ${contactErrorMessage(failed[0].failure)}`);
      } else { setBulkRemoving(null); refresh(); }
    } finally { deleteLock.current = false; setDeleting(false); }
  };
  const pages = Math.max(1, Math.ceil(result.count / CONTACT_PAGE_SIZE));
  const filtered = Boolean(filters.search || filters.category || filters.channel);
  const activeFilterCount = Number(Boolean(filters.category)) + Number(Boolean(filters.channel)) + Number(filters.sort !== 'name');
  const mobileGroups = filters.sort === 'name' ? Object.entries(result.contacts.reduce((groups, contact) => {
    const first = [...contact.name.trim()][0]?.toLocaleUpperCase() || '#';
    const letter = /\p{L}/u.test(first) ? first : '#';
    (groups[letter] ||= []).push(contact);
    return groups;
  }, {})) : [['Recently added', result.contacts]];
  const clearFilters = () => filter({ search: '', category: '', channel: '' });
  const copy = async value => {
    try { await navigator.clipboard.writeText(value); toast.success('Copied to clipboard.'); }
    catch { toast.error('Could not copy. Select the detail and copy it manually.'); }
  };
  const contactText = contact => [contact.name, CONTACT_CATEGORIES.find(item => item.value === contactCategory(contact.category))?.label, ...contactPhones(contact).map(item => item.phone), contact.email, contact.location, contact.map_url].filter(Boolean).join('\n');
  const copyContact = contact => copy(contactText(contact));
  const editContact = contact => { setViewing(null); setEditor({ contact }); };
  const confirmDelete = contact => { setViewing(null); setRemoving(contact); setDeleteError(''); };
  return (
    <div className="mx-auto w-full max-w-7xl pb-32 text-theme-primary lg:pb-0">
      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6 sm:items-start">
        <div className="min-w-0">
          <p className="mb-2 flex items-center gap-2 text-[10px] opacity-45 sm:mb-3 sm:text-xs"><Link to="../tools" className="hover:text-[var(--accent)] hover:underline">Tools</Link> <ChevronRight size={12} /> Shared directory</p>
          <h1 className="flex items-center gap-3 text-[23px] font-semibold tracking-tight sm:text-3xl"><BookUser size={28} className="hidden text-[var(--accent)] sm:block" />ICMU Contacts</h1>
          <p className="mt-1 text-xs opacity-50 sm:hidden">Your team's useful connections.</p>
          <p className="mt-2 hidden max-w-xl text-sm opacity-55 sm:block">Good connections. Ready for your next project.</p>
        </div>
        <button type="button" aria-label="Add contact" className={primaryClass + ' shrink-0 max-sm:h-11 max-sm:w-11 max-sm:rounded-full max-sm:!px-0'} onClick={() => setEditor({ contact: null })} disabled={Boolean(error)}><Plus size={20} /><span className="hidden sm:inline">Add contact</span></button>
      </div>
      <div className="flex items-start gap-7">
      <aside aria-label="Contact lists" className="sticky top-6 hidden w-48 shrink-0 xl:block">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest opacity-40">Your lists</p>
        {[{ value: '', label: 'All contacts', Icon: BookUser }, { value: 'whatsapp', label: 'On WhatsApp', Icon: MessageCircle }, { value: 'phone', label: 'With phone', Icon: Phone }, { value: 'email', label: 'With email', Icon: Mail }].map(({ value, label, Icon }) =>
          <button key={value} type="button" aria-pressed={filters.channel === value && !filters.category} onClick={() => filter({ channel: value, category: '' })}
            className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${filters.channel === value && !filters.category ? 'bg-[var(--admin-border)] font-medium text-[var(--accent)]' : 'opacity-60 hover:bg-[var(--admin-border)] hover:opacity-100'}`}>{createElement(Icon, { size: 16 })}{label}</button>)}
        <div className="my-5 border-t border-theme-base" />
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest opacity-40">Categories</p>
        <div className="max-h-[45vh] overflow-y-auto pr-1">{CONTACT_CATEGORIES.map((category, index) => <button key={category.value} type="button" aria-pressed={filters.category === category.value} onClick={() => filter({ category: category.value, channel: '' })}
          className={`mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition-colors hover:bg-[var(--admin-border)] ${filters.category === category.value ? 'bg-[var(--admin-border)] font-semibold' : 'opacity-60'}`}><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: categoryColors[index % categoryColors.length] }} />{category.label}</button>)}</div>
        <p className="mt-6 px-3 text-xs leading-relaxed opacity-40">Shared with all admins.<br />One connection can help the whole team.</p>
      </aside>
      <div className="min-w-0 flex-1">
      {selecting && <div role="toolbar" aria-label="Selected contact actions" className="contact-menu-surface sticky top-3 z-20 mb-4 flex flex-wrap items-center gap-1 rounded-2xl p-2">
        <button type="button" aria-label="Exit selection" onClick={clearSelection} className={buttonClass + ' !border-0 !px-3'}><X size={17} /></button>
        <span role="status" className="mr-auto text-sm font-medium">{selectedContacts.length} selected</span>
        <button type="button" onClick={selectPage} aria-pressed={allSelected} className={buttonClass + ' !border-0 !px-3 !text-xs'}>{allSelected ? 'Deselect' : 'Select all'}</button>
        <button type="button" aria-label="Copy selected contacts" title="Copy selected contacts" disabled={!selectedContacts.length} onClick={() => copy(selectedContacts.map(contactText).join('\n\n'))} className={buttonClass + ' !border-0 !px-3'}><Copy size={17} /></button>
        <button type="button" aria-label="Delete selected contacts" title="Delete selected contacts" disabled={!selectedContacts.length} onClick={() => { setBulkError(''); setBulkRemoving(selectedContacts); }} className={buttonClass + ' !border-0 !px-3 text-red-500'}><Trash2 size={17} /></button>
      </div>}
      <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:flex-wrap sm:rounded-2xl sm:border sm:border-theme-base sm:bg-[var(--admin-card-bg)] sm:p-2">
        <div className="relative min-w-0 flex-1 sm:basis-60">
          <Search size={17} className="pointer-events-none absolute left-3 top-3.5 opacity-50" />
          <label htmlFor="contact-search" className="sr-only">Search contacts</label>
          <input id="contact-search" type="search" className={inputClass + ' pl-10 max-sm:!bg-[var(--admin-card-bg)]'} placeholder="Search contacts…" maxLength={100} value={filters.search} onChange={event => filter({ search: event.target.value })} />
        </div>
        <button type="button" aria-label={activeFilterCount ? `Filters and sorting, ${activeFilterCount} active` : 'Filters and sorting'} onClick={() => setFiltersOpen(true)} className={buttonClass + ' relative shrink-0 !px-3 sm:hidden'}><SlidersHorizontal size={17} />{activeFilterCount > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] text-[var(--accent-text,#000)]">{activeFilterCount}</span>}</button>
        <ContactCategoryPicker ariaLabel="Filter by category" value={filters.category} onChange={category => filter({ category })} allowAll className="hidden w-60 sm:block" />
        <label htmlFor="contact-channel" className="sr-only">Contact method</label>
        <select id="contact-channel" className={inputClass + ' hidden sm:block sm:!w-auto xl:hidden'} value={filters.channel} onChange={event => filter({ channel: event.target.value })}>
          <option value="">All contact methods</option><option value="whatsapp">On WhatsApp</option><option value="phone">With phone</option><option value="email">With email</option>
        </select>
        <button type="button" className={buttonClass + ' !hidden !px-3 sm:!inline-flex'} onClick={refresh} disabled={loading} aria-label="Refresh contacts"><RefreshCw size={17} /></button>
      </div>
      {!selecting && !loading && !error && result.contacts.length > 0 && <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[10px] opacity-45 sm:hidden">Hold a contact to select</p>
        <button type="button" onClick={() => setSelecting(true)} className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs opacity-65 hover:bg-[var(--admin-border)] focus-visible:outline focus-visible:outline-[var(--accent)]"><ListChecks size={16} />Select contacts</button>
      </div>}
      <Tabs value={filters.channel} onValueChange={channel => filter({ channel })} variant="pill" className="mb-4 overflow-x-auto rounded-full bg-[var(--admin-card-bg)] sm:hidden">
        <TabsList aria-label="Quick contact lists" className="!flex w-max min-w-full justify-between !gap-0 !bg-transparent !p-1" onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          const buttons = [...event.currentTarget.querySelectorAll('[role="tab"]')];
          const position = buttons.indexOf(document.activeElement);
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (position + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
          event.preventDefault(); buttons[next]?.focus(); buttons[next]?.click();
        }}>
          {contactMethods.map(({ value, label, Icon }) => <TabsTrigger key={value} value={value} tabIndex={filters.channel === value ? 0 : -1} indicatorClassName="!bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]" className={`!min-h-10 !gap-1.5 !px-3 !text-[11px] focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${filters.channel === value ? '!text-[var(--accent)]' : '!text-theme-primary opacity-50'}`}>{createElement(Icon, { size: 13 })}{label}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      {filters.category && <div className="mb-4 sm:hidden"><button type="button" onClick={() => filter({ category: '' })} className="flex min-h-9 max-w-full items-center gap-2 rounded-lg bg-[var(--admin-border)] px-3 text-xs"><span className="truncate">{CONTACT_CATEGORIES.find(category => category.value === filters.category)?.label}</span><X size={13} className="shrink-0" /><span className="sr-only">Remove category filter</span></button></div>}
      <div className="mb-5 hidden flex-wrap items-center justify-between gap-3 sm:flex">
        <div className="flex items-center gap-2 text-xs opacity-65"><SlidersHorizontal size={14} /><label htmlFor="contact-sort">Sort by</label><select id="contact-sort" className="rounded-lg bg-[var(--admin-bg)] py-2 pr-2 text-theme-primary outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" value={filters.sort} onChange={event => filter({ sort: event.target.value })}><option value="name">Name A–Z</option><option value="recent">Recently added</option></select></div>
        <div className="flex items-center gap-2">{filtered && <button type="button" className="mr-2 inline-flex items-center gap-1 text-xs opacity-65 hover:opacity-100" onClick={clearFilters}>Clear filters<X size={13} /></button>}<div className="flex rounded-xl border border-theme-base p-1" aria-label="Contact view"><button type="button" aria-label="Card view" aria-pressed={layout === 'grid'} className={`rounded-lg p-2 ${layout === 'grid' ? 'bg-[var(--admin-border)] text-[var(--accent)]' : 'opacity-40'}`} onClick={() => setLayout('grid')}><Grid2X2 size={16} /></button><button type="button" aria-label="List view" aria-pressed={layout === 'list'} className={`rounded-lg p-2 ${layout === 'list' ? 'bg-[var(--admin-border)] text-[var(--accent)]' : 'opacity-40'}`} onClick={() => setLayout('list')}><List size={16} /></button></div></div>
      </div>
      {error ? (
        <div role="alert" className="rounded-2xl border border-theme-base p-8 text-center"><p className="mb-4">{error}</p><div className="flex justify-center gap-3"><button type="button" className={buttonClass} onClick={refresh}>Try again</button>{accessDenied && <button type="button" className={primaryClass} onClick={onSignInAgain}>Sign in again</button>}</div></div>
      ) : loading ? (
        <div role="status" className="flex items-center justify-center gap-3 py-20 text-sm opacity-70"><LoaderCircle size={20} className="animate-spin" />Loading contacts…</div>
      ) : result.contacts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-theme-base px-5 py-9 text-center sm:p-10">
          <BookUser size={30} className="mx-auto mb-4 opacity-35" />
          <h2 className="mb-2 text-lg font-semibold">{filtered ? 'No matching contacts' : 'Keep good connections close'}</h2>
          <p className="mx-auto max-w-xs text-xs leading-relaxed opacity-55 sm:mb-5 sm:text-sm">{filtered ? 'Try another search, category, or contact method.' : 'Tap + to save someone the team can turn to.'}</p>
          {filtered && <button type="button" onClick={clearFilters} className={buttonClass + ' mt-4'}>Clear filters</button>}
          {!filtered && <button type="button" className={primaryClass + ' !hidden sm:!inline-flex'} onClick={() => setEditor({ contact: null })}><Plus size={17} />Add your first contact</button>}
        </div>
      ) : (
        <>
          <p role="status" className="mb-4 text-xs opacity-45">{result.count} {result.count === 1 ? 'contact' : 'contacts'}{filtered ? ' found' : ' shared with admins'}</p>
          <div className="space-y-4 sm:hidden">{mobileGroups.map(([letter, contacts]) => <div key={letter} role="group" aria-label={letter === '#' ? 'Other names' : letter}>
            <h2 className="mb-1.5 px-3 text-[11px] font-semibold opacity-40">{letter}</h2>
            <div className="divide-y divide-[var(--admin-border)] overflow-hidden rounded-2xl bg-[var(--admin-card-bg)]">{contacts.map(contact => <ContactRow key={contact.id} contact={contact} onView={setViewing} onEdit={editContact} onDelete={confirmDelete} onCopy={copyContact} selecting={selecting} selected={selected.has(contact.id)} onSelect={selectContact} />)}</div>
          </div>)}</div>
          <div className={layout === 'grid' ? 'hidden grid-cols-1 gap-4 sm:grid md:grid-cols-2 2xl:grid-cols-3' : 'hidden flex-col gap-3 sm:flex'}>
            {result.contacts.map(contact => <ContactCard key={contact.id} contact={contact} layout={layout} onView={setViewing} onEdit={editContact} onDelete={confirmDelete} onCopy={copyContact} selecting={selecting} selected={selected.has(contact.id)} onSelect={selectContact} />)}
          </div>
          {pages > 1 && <nav aria-label="Contact pages" className="mt-6 flex items-center justify-between gap-3">
            <button type="button" className={buttonClass} disabled={filters.page === 0} onClick={() => filter({ page: filters.page - 1 })}><ChevronLeft size={16} />Previous</button>
            <span className="text-sm opacity-65">{filters.page + 1} / {pages}</span>
            <button type="button" className={buttonClass} disabled={filters.page + 1 >= pages} onClick={() => filter({ page: filters.page + 1 })}>Next<ChevronRight size={16} /></button>
          </nav>}
        </>
      )}
      </div>
      </div>
      {filtersOpen && <ContactDialog drawer title="Filters & sorting" onClose={() => setFiltersOpen(false)}>
        <div className="space-y-5">
          <div><p className="mb-2 text-xs opacity-60">Category</p><ContactCategoryPicker ariaLabel="Choose a category filter" value={filters.category} onChange={category => filter({ category })} allowAll /></div>
          <div><label htmlFor="mobile-contact-channel" className="mb-2 block text-xs opacity-60">Contact method</label><select id="mobile-contact-channel" className={inputClass} value={filters.channel} onChange={event => filter({ channel: event.target.value })}><option value="">All contact methods</option><option value="whatsapp">On WhatsApp</option><option value="phone">With phone</option><option value="email">With email</option></select></div>
          <div><label htmlFor="mobile-contact-sort" className="mb-2 block text-xs opacity-60">Sort by</label><select id="mobile-contact-sort" className={inputClass} value={filters.sort} onChange={event => filter({ sort: event.target.value })}><option value="name">Name A–Z</option><option value="recent">Recently added</option></select></div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-2"><button type="button" className={buttonClass + ' !px-3'} onClick={refresh} disabled={loading} aria-label="Refresh contacts"><RefreshCw size={17} /></button><div className="flex gap-2"><button type="button" className={buttonClass} onClick={() => filter({ category: '', channel: '', sort: 'name' })} disabled={!activeFilterCount}>Reset</button><button data-modal-close type="button" className={primaryClass} onClick={() => setFiltersOpen(false)}>Done</button></div></div>
      </ContactDialog>}
      {viewing && <ContactDialog drawer hero title="Contact details" onClose={() => setViewing(null)} actions={<ContactActionMenu contact={viewing} onEdit={editContact} onDelete={confirmDelete} onCopy={copyContact} />}>
        <div className="mb-6 text-center">
          <div aria-hidden="true" className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-medium ${toneClass}`}>{viewing.name.trim().split(/\s+/).slice(0, 2).map(word => [...word][0]).join('').toLocaleUpperCase()}</div>
          <h3 className="break-words text-xl font-semibold">{viewing.name}</h3>
          <p className={`mt-2 inline-block rounded-full px-3 py-1.5 text-[10px] ${toneClass}`}>{CONTACT_CATEGORIES.find(item => item.value === contactCategory(viewing.category))?.label}{viewing.contact_person ? ` · ${viewing.contact_person}` : ''}</p>
        </div>
        <div className="mb-6"><ContactQuickActions contact={viewing} labels /></div>
        <dl className="divide-y divide-[var(--admin-border)] rounded-2xl bg-[var(--admin-bg)] px-4">
          {contactPhones(viewing).map((item, index, phones) => <div key={item.phone} className="flex items-center gap-2 py-3"><Phone size={17} className="mr-1 shrink-0 opacity-40" /><div className="min-w-0 flex-1"><dt className="mb-1 text-[10px] opacity-45">{phones.length === 1 ? 'Phone' : `Phone ${index + 1}`}</dt><dd className="break-all text-sm">{item.phone}</dd></div>{phones.length > 1 && <div className="flex"><a href={`tel:${item.phone}`} aria-label={`Call ${item.phone}`} className={`flex h-10 w-10 items-center justify-center rounded-full ${toneClass}`}><Phone size={15} /></a>{item.whatsapp_enabled && <a href={`https://wa.me/${item.phone.slice(1)}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${item.phone}`} className={`ml-1 flex h-10 w-10 items-center justify-center rounded-full ${toneClass}`}><MessageCircle size={15} /></a>}</div>}</div>)}
          {[['email', 'Email', Mail], ['location', 'Address', Building2], ['map_url', 'Map link', MapPin]].map(([key, label, Icon]) => viewing[key] && <div key={key} className="flex items-start gap-3 py-4">{createElement(Icon, { size: 17, className: 'mt-1 shrink-0 opacity-40' })}<div className="min-w-0"><dt className="mb-1 text-[10px] opacity-45">{label}</dt><dd className="break-words text-sm">{key === 'map_url' && normalizeMapUrl(viewing.map_url) ? <a href={normalizeMapUrl(viewing.map_url)} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Open in Maps<ChevronRight size={13} className="ml-1 inline" /></a> : viewing[key]}</dd></div></div>)}</dl>
        {viewing.notes && <div className="mt-5"><h3 className="mb-2 text-xs font-medium opacity-50">Notes</h3><p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{viewing.notes}</p></div>}
      </ContactDialog>}
      {editor && <ContactForm contact={editor.contact} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); refresh(); }} />}
      {removing && <ContactDialog title="Delete contact?" busy={deleting} onClose={() => setRemoving(null)}>
        <p className="break-words text-sm opacity-80">Remove <strong>{removing.name}</strong> from the shared directory? This cannot be undone.</p>
        {deleteError && <p role="alert" className="mt-4 text-sm text-red-500">{deleteError}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button data-modal-close type="button" className={buttonClass} disabled={deleting} onClick={() => setRemoving(null)}>Cancel</button>
          <button type="button" className={buttonClass + ' bg-red-600 text-white hover:!bg-red-700'} disabled={deleting} onClick={remove}>{deleting && <LoaderCircle size={16} className="animate-spin" />}{deleting ? 'Deleting…' : 'Delete contact'}</button>
        </div>
      </ContactDialog>}
      {bulkRemoving && <ContactDialog title={`Delete ${bulkRemoving.length} ${bulkRemoving.length === 1 ? 'contact' : 'contacts'}?`} busy={deleting} onClose={() => { setBulkRemoving(null); if (bulkError) refresh(); }}>
        <p className="text-sm opacity-80">These contacts will be removed for every admin. This cannot be undone.</p>
        <ul className="mt-4 max-h-40 space-y-2 overflow-y-auto rounded-xl bg-[var(--admin-bg)] p-3 text-sm">{bulkRemoving.map(contact => <li key={contact.id} className="break-words">{contact.name}</li>)}</ul>
        {bulkError && <p role="alert" className="mt-4 text-sm text-red-500">{bulkError}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button data-modal-close type="button" className={buttonClass} disabled={deleting}>Cancel</button>
          <button type="button" className={buttonClass + ' bg-red-600 text-white hover:!bg-red-700'} disabled={deleting} onClick={removeSelected}>{deleting && <LoaderCircle size={16} className="animate-spin" />}{deleting ? 'Deleting…' : 'Delete selected'}</button>
        </div>
      </ContactDialog>}
    </div>
  );
}

export default function ContactsSaver() {
  const { user, logout } = useAuth();
  const { adminPath } = useParams();
  if (!isAdmin(user?.role)) return <Navigate to={`/${adminPath}/dashboard`} replace />;
  return <ContactDirectory key={user.id} onSignInAgain={logout} />;
}
