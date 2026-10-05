-- Broader event services; keep historical printing categories valid.
alter table public.admin_contacts drop constraint admin_contacts_category_check;
alter table public.admin_contacts add constraint admin_contacts_category_check check (category in (
  'printing-branding','badge-printing','banner-printing','design-creative','photo-video',
  'event-production','decor-floristry','merchandise-gifts','equipment-rental',
  'sound-lighting','led-walls','venues','sponsorships','catering','transport-logistics',
  'accommodation','crew-staffing','other'
));
