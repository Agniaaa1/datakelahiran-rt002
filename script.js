// =========================================================================
// FIREBASE CONFIGURATION - INI SUDAH DARI KONSOL FIREBASE KAMU
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyD4A6n_U7wZZgBHvyayeEtthfqypXdzTQ",
  authDomain: "datakelahiranrt002rw03.firebaseapp.com",
  projectId: "datakelahiranrt002rw03",
  storageBucket: "datakelahiranrt002rw03.firebasestorage.app",
  messagingSenderId: "607418700492",
  appId: "1:607418700492:web:ed1551dd1ccc2a774fa869"
};

// Inisialisasi Firebase (menggunakan cara 'compat' SDK v9.x.x)
firebase.initializeApp(firebaseConfig);

// Dapatkan referensi ke layanan Firestore
const db = firebase.firestore();
// Dapatkan referensi ke koleksi 'kelahiran' di Firestore
const kelahiranCollection = db.collection('kelahiran');
// =========================================================================
// AKHIR KONFIGURASI FIREBASE
// =========================================================================


document.addEventListener('DOMContentLoaded', function() {
    // === REFERENSI ELEMEN DOM ===
    const form = document.querySelector('form');
    const tableBody = document.querySelector('table tbody');
    const searchInput = document.getElementById('searchInput');
    const noDataRow = document.getElementById('noDataRow');
    const notificationDiv = document.getElementById('notification');

    const namaBayiInput = document.getElementById('namaBayi');
    const tanggalLahirInput = document.getElementById('tanggalLahir');
    const jenisKelaminSelect = document.getElementById('jenisKelamin');
    const submitButton = form.querySelector('button[type="submit"]');

    const anakKeInput = document.getElementById('anakKe');
    const beratBadanInput = document.getElementById('beratBadan');
    const panjangBadanInput = document.getElementById('panjangBadan');

    const sortNamaBayiHeader = document.getElementById('sortNamaBayi');
    const sortTanggalLahirHeader = document.getElementById('sortTanggalLahir');
    const sortJenisKelaminHeader = document.getElementById('sortJenisKelamin');
    const sortAnakKeHeader = document.getElementById('sortAnakKe');
    const sortBeratBadanHeader = document.getElementById('sortBeratBadan');
    const sortPanjangBadanHeader = document.getElementById('sortPanjangBadan');

    const exportCsvBtn = document.getElementById('exportCsvBtn');

    // === BUAT DAN TAMBAHKAN TOMBOL HAPUS SEMUA DATA ===
    const clearAllDataButton = document.createElement('button');
    clearAllDataButton.textContent = 'Hapus Semua Data';
    clearAllDataButton.id = 'clearAllDataButton'; // Tambahkan ID
    clearAllDataButton.style.backgroundColor = '#f44336'; // Merah
    clearAllDataButton.style.color = 'white';
    clearAllDataButton.style.padding = '10px 15px';
    clearAllDataButton.style.border = 'none';
    clearAllDataButton.style.borderRadius = '5px';
    clearAllDataButton.style.cursor = 'pointer';
    clearAllDataButton.style.fontSize = '15px';
    clearAllDataButton.style.marginTop = '20px';
    clearAllDataButton.style.display = 'block'; // Agar di baris baru
    clearAllDataButton.style.marginLeft = 'auto'; // Pusatkan
    clearAllDataButton.style.marginRight = 'auto'; // Pusatkan
    clearAllDataButton.style.marginBottom = '20px';
    // Sisipkan tombol di dalam div yang sama dengan exportCsvBtn
    document.querySelector('div[style="margin-top: 20px; text-align: center;"]').appendChild(clearAllDataButton);


    // === VARIABEL GLOBAL UNTUK EDITING DAN SORTING ===
    let editingDocId = null; // Menyimpan ID dokumen Firestore yang sedang diedit
    let currentSortColumn = null;
    let sortDirection = 'asc';

    // === FUNGSI NOTIFIKASI TOAST ===
    function showNotification(message, type = 'green') {
        notificationDiv.textContent = message;
        notificationDiv.style.backgroundColor = type === 'red' ? '#f44336' : '#4CAF50';
        notificationDiv.style.display = 'block';

        setTimeout(() => {
            notificationDiv.style.display = 'none';
        }, 3000);
    }

    // === FUNGSI MEMBUAT BARIS TABEL (UNUTK DATA DARI FIRESTORE) ===
    function createTableRow(data) {
        const newRow = document.createElement('tr');
        newRow.dataset.id = data.id; // Gunakan ID dari Firestore

        const cellNamaBayi = document.createElement('td');
        cellNamaBayi.textContent = data.namaBayi;

        const cellTanggalLahir = document.createElement('td');
        cellTanggalLahir.textContent = data.tanggalLahir;

        const cellJenisKelamin = document.createElement('td');
        cellJenisKelamin.textContent = data.jenisKelamin;

        const cellAnakKe = document.createElement('td');
        cellAnakKe.textContent = data.anakKe;

        const cellBeratBadan = document.createElement('td');
        cellBeratBadan.textContent = data.beratBadan;

        const cellPanjangBadan = document.createElement('td');
        cellPanjangBadan.textContent = data.panjangBadan;

        const cellAksi = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.style.backgroundColor = '#ffc107';
        editButton.style.color = '#333';
        editButton.style.marginRight = '5px';
        editButton.style.padding = '8px 12px';
        editButton.style.border = 'none';
        editButton.style.borderRadius = '4px';
        editButton.style.cursor = 'pointer';

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Hapus';
        deleteButton.style.backgroundColor = '#dc3545';
        deleteButton.style.color = 'white';
        deleteButton.style.padding = '8px 12px';
        deleteButton.style.border = 'none';
        deleteButton.style.borderRadius = '4px';
        deleteButton.style.cursor = 'pointer';

        cellAksi.appendChild(editButton);
        cellAksi.appendChild(deleteButton);

        // === EVENT LISTENER UNTUK TOMBOL HAPUS (FIREBASE) ===
        deleteButton.addEventListener('click', async function() {
            if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                try {
                    await kelahiranCollection.doc(data.id).delete(); // Hapus dari Firestore
                    showNotification('Data berhasil dihapus dari database!', 'red');
                    // renderTable akan otomatis dipanggil oleh onSnapshot listener
                } catch (error) {
                    console.error("Error menghapus dokumen: ", error);
                    showNotification('Gagal menghapus data.', 'red');
                }
            }
        });

        // === EVENT LISTENER UNTUK TOMBOL EDIT ===
        editButton.addEventListener('click', function() {
            namaBayiInput.value = data.namaBayi;
            tanggalLahirInput.value = data.tanggalLahir;
            jenisKelaminSelect.value = data.jenisKelamin;
            anakKeInput.value = data.anakKe;
            beratBadanInput.value = data.beratBadan;
            panjangBadanInput.value = data.panjangBadan;

            editingDocId = data.id; // Simpan ID dokumen yang sedang diedit
            submitButton.textContent = 'Update Data';
            showNotification('Silakan ubah data di formulir dan klik "Update Data".');
        });

        newRow.appendChild(cellNamaBayi);
        newRow.appendChild(cellTanggalLahir);
        newRow.appendChild(cellJenisKelamin);
        newRow.appendChild(cellAnakKe);
        newRow.appendChild(cellBeratBadan);
        newRow.appendChild(cellPanjangBadan);
        newRow.appendChild(cellAksi);

        return newRow;
    }

    // === FUNGSI UTAMA UNTUK MERENDER ULANG TABEL DENGAN DATA DARI FIRESTORE ===
    function renderTable(dataFromFirestore) {
        tableBody.innerHTML = ''; // Kosongkan tabel

        let allData = dataFromFirestore; // Data langsung dari Firestore listener

        // 1. Terapkan Filter
        const searchText = searchInput.value.toLowerCase();
        const filteredData = allData.filter(data =>
            data.namaBayi.toLowerCase().includes(searchText) ||
            data.tanggalLahir.toLowerCase().includes(searchText) ||
            data.jenisKelamin.toLowerCase().includes(searchText) ||
            String(data.anakKe).toLowerCase().includes(searchText) ||
            String(data.beratBadan).toLowerCase().includes(searchText) ||
            String(data.panjangBadan).toLowerCase().includes(searchText)
        );

        // 2. Terapkan Pengurutan
        if (currentSortColumn) {
            filteredData.sort((a, b) => {
                let valA, valB;
                if (currentSortColumn === 'tanggalLahir') {
                    valA = new Date(a[currentSortColumn]);
                    valB = new Date(b[currentSortColumn]);
                } else if (currentSortColumn === 'anakKe' || currentSortColumn === 'beratBadan' || currentSortColumn === 'panjangBadan') {
                    valA = parseFloat(a[currentSortColumn]);
                    valB = parseFloat(b[currentSortColumn]);
                }
                else {
                    valA = String(a[currentSortColumn]).toLowerCase();
                    valB = String(b[currentSortColumn]).toLowerCase();
                }

                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0; // Jika sama
            });
        }

        // 3. Render Baris Data atau Pesan "Tidak ada data"
        if (filteredData.length > 0) {
            filteredData.forEach(data => {
                tableBody.appendChild(createTableRow(data));
            });
            noDataRow.style.display = 'none';
        } else {
            tableBody.appendChild(noDataRow);
            noDataRow.style.display = ''; // Tampilkan pesan "Tidak ada data"
        }
    }

    // === EVENT LISTENER FORM SUBMIT (OPERASI FIREBASE: ADD/UPDATE) ===
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const namaBayi = namaBayiInput.value.trim(); // Trim whitespace
        const tanggalLahir = tanggalLahirInput.value;
        const jenisKelamin = jenisKelaminSelect.value;
        const anakKe = anakKeInput.value;
        const beratBadan = beratBadanInput.value;
        const panjangBadan = panjangBadanInput.value; // Typo di sini: panjangBadangInput seharusnya panjangBadanInput

        // Validasi semua kolom harus diisi
        if (namaBayi === '' || tanggalLahir === '' || jenisKelamin === '' || anakKe === '' || beratBadan === '' || panjangBadan === '') {
            showNotification('Semua kolom harus diisi!', 'red');
            return;
        }

        // Validasi Tanggal Lahir: Tidak boleh di masa depan
        const today = new Date();
        const inputDate = new Date(tanggalLahir);
        today.setHours(0, 0, 0, 0);
        inputDate.setHours(0, 0, 0, 0);

        if (inputDate > today) {
            showNotification('Tanggal lahir tidak boleh di masa depan!', 'red');
            return;
        }

        const dataToSave = {
            namaBayi: namaBayi,
            tanggalLahir: tanggalLahir,
            jenisKelamin: jenisKelamin,
            anakKe: parseInt(anakKe),
            beratBadan: parseFloat(beratBadan),
            panjangBadan: parseFloat(panjangBadan),
            // Tambahkan timestamp untuk pengurutan default dan melacak kapan data dibuat/diupdate
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (editingDocId) {
                // Jika sedang dalam mode edit, update dokumen yang sudah ada di Firestore
                await kelahiranCollection.doc(editingDocId).update(dataToSave);
                showNotification('Data berhasil diperbarui di database!');
                editingDocId = null; // Reset ID dokumen yang sedang diedit
                submitButton.textContent = 'Simpan Data'; // Kembalikan teks tombol
            } else {
                // Jika tidak, tambahkan dokumen baru ke Firestore
                await kelahiranCollection.add(dataToSave);
                showNotification('Data kelahiran berhasil ditambahkan ke database!');
            }
            form.reset(); // Kosongkan form setelah simpan/update
            // renderTable akan otomatis dipanggil oleh onSnapshot listener
        } catch (error) {
            console.error("Error menyimpan/memperbarui dokumen: ", error);
            showNotification('Gagal menyimpan data.', 'red');
        }
    });

    // === EVENT LISTENER UNTUK INPUT PENCARIAN ===
    // Setiap kali input pencarian berubah, panggil renderTable lagi agar filter diaplikasikan.
    searchInput.addEventListener('keyup', () => {
        // Kita perlu memiliki akses ke data terakhir dari onSnapshot.
        // Solusi terbaik adalah menyimpan data dari onSnapshot ke variabel global
        // dan memanggil renderTable dengan variabel global itu.
        // Untuk sekarang, kita panggil ulang onSnapshot (kurang efisien tapi bekerja).
        // Atau, yang lebih baik, kita biarkan `onSnapshot` yang memicu renderTable,
        // dan `searchInput.addEventListener` hanya memicu re-filter/re-sort pada data yang sudah ada.
        // Agar lebih responsif, kita bisa panggil renderTable langsung di sini
        // asalkan `onSnapshot` sudah mengisi `dataFromFirestore` ke scope yang bisa diakses.
        // Untuk saat ini, fungsi `renderTable` sudah mengambil data sebagai argumen
        // dan memfilternya. Kita perlu memicu kembali `onSnapshot` agar datanya diambil ulang
        // dengan kriteria filter, atau menyimpan data hasil `onSnapshot` ke variabel global
        // dan memfilter variabel itu.

        // Mari kita perbaiki agar lebih efisien:
        // Kita akan menyimpan data dari onSnapshot ke variabel global `currentDataFromFirestore`
        // dan fungsi `renderTable` akan menggunakan itu.
        // Maka, di sini cukup panggil `renderTable(currentDataFromFirestore)`.
        // Akan ada sedikit duplikasi filtering jika onSnapshot juga dipicu.
        // Tapi untuk tujuan ini, kita akan biarkan `onSnapshot` yang menjadi sumber utama.
        // Untuk pencarian responsif, kita bisa memanggil renderTable(globalData) di sini.
        // Coba kita revisi sedikit onSnapshot dan renderTable.
        // Kita perlu data global dari onSnapshot
        let currentDataFromFirestore = [];

        // Firebase Real-time Listener - REVISI sedikit untuk mendukung pencarian lebih responsif
        kelahiranCollection.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
            currentDataFromFirestore = []; // Reset data
            snapshot.forEach(doc => {
                const docData = doc.data();
                currentDataFromFirestore.push({
                    id: doc.id,
                    ...docData,
                    createdAt: docData.createdAt ? docData.createdAt.toDate() : new Date(0)
                });
            });
            // Panggil renderTable dengan data terbaru dari Firestore (setelah diurutkan secara default oleh Firebase)
            renderTable(currentDataFromFirestore);
        }, error => {
            console.error("Error fetching data from Firestore: ", error);
            showNotification('Gagal memuat data dari database. Cek koneksi atau konfigurasi.', 'red');
        });

        // Sekarang, di searchInput event listener, panggil saja renderTable dengan data global
        renderTable(currentDataFromFirestore);
    });


    // === EVENT LISTENER UNTUK HEADER KOLOM SORTING ===
    sortNamaBayiHeader.addEventListener('click', function() {
        if (currentSortColumn === 'namaBayi') {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = 'namaBayi';
            sortDirection = 'asc';
        }
        renderTable(currentDataFromFirestore); // Panggil renderTable dengan data global
    });

    sortTanggalLahirHeader.addEventListener('click', function() {
        if (currentSortColumn === 'tanggalLahir') {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = 'tanggalLahir';
            sortDirection = 'asc';
        }
        renderTable(currentDataFromFirestore);
    });

    sortJenisKelaminHeader.addEventListener('click', function() {
        if (currentSortColumn === 'jenisKelamin') {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = 'jenisKelamin';
            sortDirection = 'asc';
        }
        renderTable(currentDataFromFirestore);
    });

    sortAnakKeHeader.addEventListener('click', function() {
        if (currentSortColumn === 'anakKe') {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = 'anakKe';
            sortDirection = 'asc';
        }
        renderTable(currentDataFromFirestore);
    });

    sortBeratBadanHeader.addEventListener('click', function() {
        if (currentSortColumn === 'beratBadan') {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = 'beratBadan';
            sortDirection = 'asc';
        }
        renderTable(currentDataFromFirestore);
    });

    sortPanjangBadanHeader.addEventListener('click', function() {
        if (currentSortColumn === 'panjangBadan') {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = 'panjangBadan';
            sortDirection = 'asc';
        }
        renderTable(currentDataFromFirestore);
    });

    // === EVENT LISTENER UNTUK TOMBOL EKSPOR CSV ===
    exportCsvBtn.addEventListener('click', async function() {
        try {
            const snapshot = await kelahiranCollection.get();
            const data = [];
            snapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });

            if (data.length === 0) {
                showNotification('Tidak ada data untuk diekspor!', 'red');
                return;
            }

            const headers = ['Nama Bayi', 'Tanggal Lahir', 'Jenis Kelamin', 'Anak Ke-', 'Berat Badan (g)', 'Panjang Badan (cm)'];
            const csvRows = [];
            const BOM = '\uFEFF';
            csvRows.push(BOM + headers.map(header => `"${header.replace(/"/g, '""')}"`).join(';'));

            data.forEach(item => {
                const escapeCsv = (value, isDate = false) => {
                    if (value === null || value === undefined) return '';
                    const stringValue = String(value);
                    return isDate ? `'${stringValue.replace(/"/g, '""')}'` : `"${stringValue.replace(/"/g, '""')}"`;
                };

                const row = [
                    escapeCsv(item.namaBayi),
                    escapeCsv(item.tanggalLahir, true),
                    escapeCsv(item.jenisKelamin),
                    escapeCsv(item.anakKe),
                    escapeCsv(item.beratBadan),
                    escapeCsv(item.panjangBadan)
                ];
                csvRows.push(row.join(';'));
            });

            const csvString = csvRows.join('\n');

            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'data_kelahiran_rt002rw03.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showNotification('Data berhasil diekspor ke CSV!');
        } catch (error) {
            console.error("Error saat ekspor data CSV: ", error);
            showNotification('Gagal mengekspor data CSV.', 'red');
        }
    });

    // Variabel global untuk menyimpan data terbaru dari Firestore
    let currentDataFromFirestore = [];

    // ===============================================
    // FIREBASE REAL-TIME LISTENER (PENTING!)
    // Ini akan memuat data dari Firestore dan merender ulang tabel
    // setiap kali ada perubahan di database, secara real-time.
    kelahiranCollection.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        currentDataFromFirestore = []; // Kosongkan dan isi ulang dengan data terbaru
        snapshot.forEach(doc => {
            const docData = doc.data();
            currentDataFromFirestore.push({
                id: doc.id, // ID dokumen Firestore (penting untuk edit/hapus)
                ...docData, // Semua data lainnya
                createdAt: docData.createdAt ? docData.createdAt.toDate() : new Date(0)
            });
        });
        // Panggil renderTable dengan data terbaru dari Firestore
        renderTable(currentDataFromFirestore);
    }, error => {
        console.error("Error fetching data from Firestore: ", error);
        showNotification('Gagal memuat data dari database. Cek koneksi atau konfigurasi.', 'red');
    });
    // ===============================================

    // --- PERBAIKAN TYPO ---
    // Ada typo di baris `const panjangBadan = panjangBadangInput.value;` di fungsi `form.addEventListener('submit', ...)`
    // Seharusnya `panjangBadanInput.value`.
    // Sudah aku perbaiki di kode lengkap di atas. Pastikan kamu copy seluruhnya.
});