"use client";

type Props = {
  next: () => void;
};

export default function Step1JenisStudi({ next }: Props) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Pengajuan Studi Lanjut</h1>

      <h2 className="text-xl mb-4">01 Pilih jenis studi</h2>

      <div className="grid grid-cols-2 gap-6">
        <div className="border p-6 rounded-xl cursor-pointer hover:border-blue-500">
          <h3 className="font-semibold">Tugas Belajar</h3>
          <p className="text-sm text-gray-500">
            Dibiayai dan dibebaskan tugas
          </p>
        </div>

        <div className="border p-6 rounded-xl cursor-pointer">
          <h3 className="font-semibold">Izin Belajar</h3>
          <p className="text-sm text-gray-500">
            Biaya sendiri tanpa dibebaskan tugas
          </p>
        </div>
      </div>

      <button
        onClick={next}
        className="mt-8 bg-blue-600 text-white px-6 py-2 rounded"
      >
        Lanjutkan
      </button>
    </div>
  );
}