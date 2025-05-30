// Konfigurasi Firebase Anda (PASTIKAN INI SESUAI DENGAN PUNYAMU DARI KONSOL FIREBASE)
const firebaseConfig = {
  apiKey: "AIzaSyD4A6n_U7wZZgBHvuyaveEtthfqypXdzTQ",
  authDomain: "datakelahiranrt002rw03.firebaseapp.com",
  projectId: "datakelahiranrt002rw03",
  storageBucket: "datakelahiranrt002rw03.firebasestorage.app",
  messagingSenderId: "607418700492",
  appId: "1:607418700492:web:ed1551dd1ccc2a774fa869"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const collectionRef = db.collection('kelahiran'); // Nama koleksi Firestore Anda

// Referensi Elemen DOM
const form = document.querySelector('form');
const tbody = document.querySelector('tbody');
const noDataRow = document.getElementById('noDataRow');
const notificationDiv = document.getElementById('notification');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const searchInput = document.getElementById('searchInput');

// Elemen untuk statistik (ID diambil dari index.html yang baru)
const totalDataElement = document.getElementById('totalData');
const totalLakiLakiElement = document.getElementById('totalLakiLaki');
const totalPerempuanElement = document.getElementById('totalPerempuan');
const avgBeratBadanElement = document.getElementById('avgBeratBadan');
const avgPanjangBadanElement = document.getElementById('avgPanjangBadan');

// --- Fungsi Notifikasi ---
function showNotification(message, type = 'success') {
    notificationDiv.textContent = message;
    if (type === 'error') {
        notificationDiv.style.backgroundColor = '#dc3545'; // Merah untuk error
    } else {
        notificationDiv.style.backgroundColor = '#4CAF50'; // Hijau untuk success
    }
    notificationDiv.style.display = 'block';

    // Sembunyikan setelah 3 detik dengan animasi fade out
    notificationDiv.style.animation = 'none'; // Reset animation
    void notificationDiv.offsetWidth; // Trigger reflow
    notificationDiv.style.animation = 'fadeOut 3s forwards';
    
    setTimeout(() => {
        notificationDiv.style.display = 'none';
        notificationDiv.style.animation = ''; // Clear animation style after fade out
    }, 3000); // Durasi total animasi + sedikit buffer
}


// --- Fungsi untuk Menampilkan Data ke Tabel ---
function displayData(documents) {
    tbody.innerHTML = ''; // Kosongkan tabel sebelum mengisi ulang
    let hasData = false;

    if (documents.length > 0) {
        documents.forEach(item => { // Perubahan di sini: 'doc' menjadi 'item'
            hasData = true;
            const data = item.data; // Perubahan di sini: 'item.data' bukan 'item.data()'
            const docId = item.id;   // Ambil ID dari 'item.id'
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', docId); // Gunakan docId yang baru

            tr.innerHTML = `
                <td>${data.namaBayi}</td>
                <td>${data.tanggalLahir}</td>
                <td>${data.jenisKelamin}</td>
                <td>${data.anakKe}</td>
                <td>${data.beratBadan}</td>
                <td>${data.panjangBadan}</td>
                <td>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Hapus</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    if (hasData) {
        noDataRow.style.display = 'none'; // Sembunyikan "Tidak ada data"
    } else {
        noDataRow.style.display = 'table-row'; // Tampilkan "Tidak ada data"
    }

    // Panggil fungsi updateStatistics setelah tabel dirender
    updateStatistics(documents);
}

// --- Fungsi untuk Mengambil Data dari Firestore (Realtime Listener) ---
function fetchData() {
    collectionRef.orderBy('createdAt', 'desc') // Urutkan berdasarkan waktu pembuatan terbaru
        .onSnapshot(snapshot => {
            const documents = [];
            snapshot.forEach(doc => {
                documents.push({ id: doc.id, data: doc.data() }); // Di sini kita membungkus data
            });
            displayData(documents); // Tampilkan data yang sudah difilter
            // updateStatistics sudah dipanggil di displayData, jadi tidak perlu panggil lagi di sini.
        }, error => {
            console.error("Error fetching documents: ", error);
            showNotification('Gagal mengambil data dari database.', 'error');
        });
}

// --- Fungsi untuk Menghitung dan Menampilkan Statistik ---
function updateStatistics(documents) {
    let totalData = documents.length;
    let totalLakiLaki = 0;
    let totalPerempuan = 0;
    let totalBeratBadan = 0;
    let totalPanjangBadan = 0;

    documents.forEach(doc => {
        const data = doc.data; // Perubahan di sini: 'doc.data' bukan 'doc.data()'
        if (data.jenisKelamin === 'laki-laki') {
            totalLakiLaki++;
        } else if (data.jenisKelamin === 'perempuan') {
            totalPerempuan++;
        }

        // Pastikan data numerik valid sebelum dihitung
        if (!isNaN(parseFloat(data.beratBadan))) {
            totalBeratBadan += parseFloat(data.beratBadan);
        }
        if (!isNaN(parseFloat(data.panjangBadan))) {
            totalPanjangBadan += parseFloat(data.panjangBadan);
        }
    });

    const avgBeratBadan = totalData > 0 ? (totalBeratBadan / totalData).toFixed(1) : 0;
    const avgPanjangBadan = totalData > 0 ? (totalPanjangBadan / totalData).toFixed(1) : 0;

    totalDataElement.textContent = totalData;
    totalLakiLakiElement.textContent = totalLakiLaki;
    totalPerempuanElement.textContent = totalPerempuan;
    avgBeratBadanElement.textContent = `${avgBeratBadan} g`;
    avgPanjangBadanElement.textContent = `${avgPanjangBadan} cm`;
}


// --- Fungsi untuk Menyimpan/Memperbarui Data ---
form.addEventListener('submit', async function(event) {
    event.preventDefault(); // Mencegah reload halaman

    const namaBayiInput = document.getElementById('namaBayi');
    const tanggalLahirInput = document.getElementById('tanggalLahir');
    const jenisKelaminInput = document.getElementById('jenisKelamin');
    const anakKeInput = document.getElementById('anakKe');
    const beratBadanInput = document.getElementById('beratBadan');
    const panjangBadanInput = document.getElementById('panjangBadan');

    const namaBayi = namaBayiInput.value.trim();
    const tanggalLahir = tanggalLahirInput.value;
    const jenisKelamin = jenisKelaminInput.value;
    const anakKe = parseInt(anakKeInput.value);
    const beratBadan = parseFloat(beratBadanInput.value);
    const panjangBadan = parseFloat(panjangBadanInput.value);

    // Validasi sederhana
    if (!namaBayi || !tanggalLahir || !jenisKelamin || isNaN(anakKe) || isNaN(beratBadan) || isNaN(panjangBadan)) {
        showNotification('Mohon lengkapi semua field dengan benar.', 'error');
        return;
    }

    // Cek apakah ini mode edit (ada data-id di form)
    const editingId = form.dataset.editingId;

    const dataToSave = {
        namaBayi: namaBayi,
        tanggalLahir: tanggalLahir,
        jenisKelamin: jenisKelamin,
        anakKe: anakKe,
        beratBadan: beratBadan,
        panjangBadan: panjangBadan,
        createdAt: firebase.firestore.FieldValue.serverTimestamp() // Tambahkan timestamp
    };

    try {
        if (editingId) {
            // Mode Edit: Update dokumen yang sudah ada
            delete dataToSave.createdAt; // Jangan update createdAt saat edit
            await collectionRef.doc(editingId).update(dataToSave);
            showNotification('Data berhasil diperbarui di database!');
            form.removeAttribute('data-editingId'); // Hapus ID edit
            form.querySelector('button[type="submit"]').textContent = 'Simpan Data'; // Ubah teks tombol
        } else {
            // Mode Tambah: Tambah dokumen baru
            await collectionRef.add(dataToSave);
            showNotification('Data berhasil disimpan ke database!');
        }

        // Reset form setelah berhasil
        form.reset();
        namaBayiInput.focus(); // Fokuskan kembali ke field nama bayi

    } catch (e) {
        console.error("Error adding/updating document: ", e);
        showNotification('Gagal menyimpan data ke database.', 'error');
    }
});

// --- Fungsi untuk Edit dan Hapus Data ---
tbody.addEventListener('click', async function(event) {
    const target = event.target;
    const row = target.closest('tr');
    if (!row) return; // Pastikan klik pada baris tabel

    const docId = row.getAttribute('data-id');

    if (target.classList.contains('edit-btn')) {
        // Mode Edit
        try {
            const doc = await collectionRef.doc(docId).get();
            if (doc.exists) {
                const data = doc.data(); // Di sini tetap 'doc.data()' karena 'doc' adalah objek dokumen Firestore asli
                document.getElementById('namaBayi').value = data.namaBayi;
                document.getElementById('tanggalLahir').value = data.tanggalLahir;
                document.getElementById('jenisKelamin').value = data.jenisKelamin;
                document.getElementById('anakKe').value = data.anakKe;
                document.getElementById('beratBadan').value = data.beratBadan;
                document.getElementById('panjangBadan').value = data.panjangBadan;

                // Simpan ID dokumen yang sedang diedit di form
                form.dataset.editingId = docId;
                form.querySelector('button[type="submit"]').textContent = 'Update Data'; // Ubah teks tombol
                showNotification('Data siap diedit. Ubah di formulir dan klik "Update Data".', 'info');
                document.getElementById('namaBayi').focus(); // Fokuskan ke input nama
            } else {
                showNotification('Dokumen tidak ditemukan.', 'error');
            }
        } catch (e) {
            console.error("Error fetching document for edit: ", e);
            showNotification('Gagal mengambil data untuk edit.', 'error');
        }

    } else if (target.classList.contains('delete-btn')) {
        // Mode Hapus
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            try {
                await collectionRef.doc(docId).delete();
                showNotification('Data berhasil dihapus dari database!');
                // fetchData() akan otomatis memperbarui tabel karena onSnapshot listener
            } catch (e) {
                console.error("Error removing document: ", e);
                showNotification('Gagal menghapus data.', 'error');
            }
        }
    }
});

// --- Fungsi Pencarian ---
searchInput.addEventListener('keyup', function() {
    const searchText = searchInput.value.toLowerCase();
    const rows = tbody.querySelectorAll('tr');

    if (rows.length === 1 && rows[0].id === 'noDataRow') {
        // Jika hanya ada baris 'noDataRow', tidak perlu melakukan pencarian
        return;
    }

    let hasMatch = false;
    rows.forEach(row => {
        if (row.id === 'noDataRow') {
            row.style.display = 'none'; // Pastikan noDataRow selalu tersembunyi saat ada pencarian
            return;
        }

        const cells = row.querySelectorAll('td');
        let match = false;
        cells.forEach(cell => {
            if (cell.textContent.toLowerCase().includes(searchText)) {
                match = true;
            }
        });
        if (match) {
            row.style.display = ''; // Tampilkan
            hasMatch = true;
        } else {
            row.style.display = 'none'; // Sembunyikan
        }
    });

    if (!hasMatch) {
        noDataRow.style.display = 'table-row'; // Tampilkan 'Tidak ada data' jika tidak ada yang cocok
        noDataRow.querySelector('td').textContent = 'Tidak ada data yang cocok dengan pencarian Anda.';
    } else {
        noDataRow.style.display = 'none'; // Sembunyikan jika ada yang cocok
        noDataRow.querySelector('td').textContent = 'Tidak ada data kelahiran yang terdaftar.'; // Kembalikan pesan default
    }
});


// --- Fungsi Sortir Tabel (Tambahan untuk Kualitas) ---
let currentSortColumn = null;
let sortDirection = 'asc'; // 'asc' for ascending, 'desc' for descending

document.querySelectorAll('th[id^="sort"]').forEach(header => {
    header.addEventListener('click', function() {
        const columnId = this.id;
        const columnName = columnId.replace('sort', '').toLowerCase(); // namaBayi, tanggalLahir, dll.

        // Adjust column names for sorting if they differ from Firestore field names
        let firestoreFieldName = columnName;
        if (columnName === 'namabayi') firestoreFieldName = 'namaBayi';
        if (columnName === 'tanggallahir') firestoreFieldName = 'tanggalLahir';
        if (columnName === 'jeniskelamin') firestoreFieldName = 'jenisKelamin';
        if (columnName === 'anakke-') firestoreFieldName = 'anakKe'; // Sesuaikan jika ada "-" di ID
        if (columnName === 'beratbadan') firestoreFieldName = 'beratBadan';
        if (columnName === 'panjangbadan') firestoreFieldName = 'panjangBadan';
        
        if (currentSortColumn === firestoreFieldName) {
            sortDirection = (sortDirection === 'asc') ? 'desc' : 'asc';
        } else {
            currentSortColumn = firestoreFieldName;
            sortDirection = 'asc';
        }

        sortData(firestoreFieldName, sortDirection);
    });
});

function sortData(columnName, direction) {
    collectionRef.orderBy(columnName, direction)
        .onSnapshot(snapshot => {
            const documents = [];
            snapshot.forEach(doc => {
                documents.push({ id: doc.id, data: doc.data() });
            });
            displayData(documents);
        }, error => {
            console.error("Error sorting documents: ", error);
            showNotification('Gagal mengurutkan data.', 'error');
        });
}

// --- Fungsi Export CSV ---
exportCsvBtn.addEventListener('click', async function() {
    try {
        const snapshot = await collectionRef.orderBy('createdAt', 'asc').get();
        let csvContent = "Nama Bayi,Tanggal Lahir,Jenis Kelamin,Anak ke-,Berat Badan (g),Panjang Badan (cm)\n";

        snapshot.forEach(doc => {
            const data = doc.data();
            const row = [
                `"${data.namaBayi}"`, // Kutip untuk nama bayi jika ada koma
                data.tanggalLahir,
                data.jenisKelamin,
                data.anakKe,
                data.beratBadan,
                data.panjangBadan
            ];
            csvContent += row.join(',') + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) { // Feature detection
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'data_kelahiran_rt002rw03.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification('Data berhasil diekspor ke CSV!');
        }
    } catch (e) {
        console.error("Error exporting CSV: ", e);
        showNotification('Gagal mengekspor data ke CSV.', 'error');
    }
});

// --- Fungsi Hapus Semua Data (Tambahan) ---
function createClearAllDataButton() {
    const containerDiv = exportCsvBtn.parentElement; // Ambil parent element dari tombol Export CSV
    const clearButton = document.createElement('button');
    clearButton.id = 'clearAllDataButton';
    clearButton.textContent = 'Hapus Semua Data';
    clearButton.classList.add('clear-all-btn'); // Tambahkan kelas untuk styling (opsional)
    containerDiv.appendChild(clearButton);

    clearButton.addEventListener('click', async function() {
        if (confirm('PERINGATAN: Anda yakin ingin MENGHAPUS SEMUA DATA kelahiran? Aksi ini tidak bisa dibatalkan!')) {
            try {
                // Hapus semua dokumen dalam batch
                const batch = db.batch();
                const snapshot = await collectionRef.get();
                snapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                showNotification('Semua data berhasil dihapus!');
                // fetchData() akan otomatis memperbarui tabel karena onSnapshot listener
            } catch (e) {
                console.error("Error deleting all documents: ", e);
                showNotification('Gagal menghapus semua data.', 'error');
            }
        }
    });
}


// --- Inisialisasi Aplikasi ---
document.addEventListener('DOMContentLoaded', function() {
    // Panggil fetchData untuk pertama kali memuat data saat halaman dimuat
    fetchData(); 
    // Buat tombol hapus semua data
    createClearAllDataButton();
});
