-- Insert status "ditolak" into master_status_pengajuan
INSERT INTO "master_status_pengajuan" ("nama_status") VALUES ('ditolak') ON CONFLICT DO NOTHING;
