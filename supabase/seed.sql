-- RRI Thumbnail Generator — Seed Data
-- Run once after migration

-- Insert default presenters (Dimas, Ammar)
insert into presenters (name, background_url, background_path, created_at, updated_at) values
  ('Dimas', null, null, now(), now()),
  ('Ammar', null, null, now(), now());

-- Insert sample speakers (optional, for demo)
-- insert into speakers (full_name, position, photo_url, created_at, updated_at) values
--   ('Dr. Yusran Asnawi, S.Pd. M.Pd.', 'Wakil Dekan Bidang Kemahasiswaan dan Kerjasama Fakultas Tarbiyah dan Keguruan UIN Ar-Raniry Banda Aceh', null, now(), now()),
--   ('Syarwan Joni, S.Pd., M.Pd', 'Kepala Bidang Pembinaan SMA & PKLK pada Dinas Pendidikan Aceh', null, now(), now()),
--   ('Dr. Muslem Yacob, S.Ag, M.Pd', 'Kepala Dinas Sosial Aceh', null, now(), now());

-- Insert singleton branding settings (all null until user uploads)
insert into branding_settings (id, rri_logo_url, pro1_logo_url, updated_at) values
  ('00000000-0000-0000-0000-000000000001', null, null, now());
