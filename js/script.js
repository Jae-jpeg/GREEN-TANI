// ── DATA LAYER (localStorage) ──
const STORAGE_KEY = 'mothernature_pesanan';

function getData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Data pesanan tidak dapat dibaca:', error);
        return [];
    }
}

function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Data pesanan gagal disimpan:', error);
        alert('Data tidak dapat disimpan. Pastikan penyimpanan browser tersedia.');
        return false;
    }
}

// ── HELPERS ──
function formatTanggal(dateStr) {
    const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const d = new Date(dateStr);
    return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
}

// ── FORM HANDLING ──
function initForm() {
    const form = document.getElementById('formPesanan');
    if (!form) return; 

    // Batasi input Nomor Telepon agar hanya angka, maksimal 13 digit
    const teleponEl = document.getElementById('telepon');
    if (teleponEl) {
        teleponEl.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 13);
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    let editMode = false;

    if (editId) {
        const data = getData();
        const itemToEdit = data.find(function(item) { return item.id == editId; });
        if (itemToEdit) {
            editMode = true;
            document.getElementById('nama').value     = itemToEdit.nama     || '';
            document.getElementById('telepon').value  = itemToEdit.telepon  || '';
            document.getElementById('email').value    = itemToEdit.email    || '';
            document.getElementById('alamat').value   = itemToEdit.alamat   || '';
            document.getElementById('kota').value     = itemToEdit.kota     || '';

            const provinsiEl = document.getElementById('provinsi');
            if (provinsiEl && itemToEdit.provinsi) provinsiEl.value = itemToEdit.provinsi;

            const produkEl = document.getElementById('produk');
            if (produkEl && itemToEdit.produk) produkEl.value = itemToEdit.produk;

            document.getElementById('jumlah').value = itemToEdit.jumlah || '';

            const pengirimanEl = document.getElementById('pengiriman');
            if (pengirimanEl && itemToEdit.pengiriman) pengirimanEl.value = itemToEdit.pengiriman;

            const pembayaranEl = document.getElementById('pembayaran');
            if (pembayaranEl && itemToEdit.pembayaran) pembayaranEl.value = itemToEdit.pembayaran;

            document.getElementById('catatan').value = itemToEdit.catatan || '';

            const btnSubmit = form.querySelector('button[type="submit"]');
            if (btnSubmit) btnSubmit.innerHTML = '✏️ Simpan Perubahan';

            // Langsung gulirkan layar ke area Form Data Pemesanan, jangan diam di paling atas
            const formWrapper = document.getElementById('formWrapper');
            if (formWrapper) {
                setTimeout(function () {
                    formWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault(); 
        const nama       = document.getElementById('nama').value.trim();
        const telepon    = document.getElementById('telepon').value.trim();
        const email      = document.getElementById('email').value.trim();
        const alamat     = document.getElementById('alamat').value.trim();
        const kota       = document.getElementById('kota').value.trim();
        const provinsi   = document.getElementById('provinsi').value.trim();
        const produk     = document.getElementById('produk').value;
        const jumlah     = document.getElementById('jumlah').value.trim();
        const pengiriman = document.getElementById('pengiriman').value;
        const pembayaran = document.getElementById('pembayaran').value;
        const catatan    = document.getElementById('catatan').value.trim();
        const errorEl = document.getElementById('formError');
        errorEl.textContent = '';

        if (!nama || !telepon || !email || !alamat || !kota || !provinsi || provinsi === 'pilihan' ||
            !produk || produk === 'pilihan' ||
            !jumlah ||
            !pengiriman || pengiriman === 'pilihan' ||
            !pembayaran || pembayaran === 'pilihan') {
            errorEl.textContent = '❌ Semua isian wajib harus dilengkapi!';
            errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (!/^[0-9]+$/.test(telepon) || telepon.length > 13) {
            errorEl.textContent = '❌ Nomor telepon hanya boleh angka, maksimal 13 digit!';
            errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (isNaN(jumlah) || Number(jumlah) < 1) {
            errorEl.textContent = '❌ Jumlah pesanan minimal 1 kg!';
            return;
        }

        const data = getData();

        if (editMode) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].id == editId) {
                    data[i].nama       = nama;
                    data[i].telepon    = telepon;
                    data[i].email      = email;
                    data[i].alamat     = alamat;
                    data[i].kota       = kota;
                    data[i].provinsi   = provinsi;
                    data[i].produk     = produk;
                    data[i].jumlah     = jumlah;
                    data[i].pengiriman = pengiriman;
                    data[i].pembayaran = pembayaran;
                    data[i].catatan    = catatan;
                    break;
                }
            }
        } else {
            const item = {
                id:         Date.now(), 
                nama:       nama,
                telepon:    telepon,
                email:      email,
                alamat:     alamat,
                kota:       kota,
                provinsi:   provinsi,
                produk:     produk,
                jumlah:     jumlah,
                pengiriman: pengiriman,
                pembayaran: pembayaran,
                catatan:    catatan,
                tanggal:    new Date().toISOString().split('T')[0] 
            };
            data.push(item);
        }

        if (!saveData(data)) return;

        form.reset();
        errorEl.textContent = '';
        alert(editMode ? '✅ Perubahan berhasil disimpan!' : '✅ Pesanan berhasil dikirim!');
        window.location.href = 'riwayat.html'; // Pindah Halaman ke riwayat
    });
}

function initRiwayat() {
    const tbody         = document.getElementById('tableBody');
    const emptyState    = document.getElementById('emptyState');
    const dataCount     = document.getElementById('dataCount');
    const btnHapusSemua = document.getElementById('btnHapusSemua');
    const tableWrapper  = document.getElementById('tableWrapper');

    if (!tbody) return;

    renderTable(); 

    if (btnHapusSemua) {
        btnHapusSemua.addEventListener('click', function () {
            if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat pesanan?')) {
                if (saveData([])) renderTable(); 
            }
        });
    }

    function renderTable() {
        const data = getData();

        if (dataCount) {
            dataCount.textContent = data.length + ' pesanan';
        }

        if (data.length === 0) {
            tbody.innerHTML = ''; // Kosongkan jikalau ada sisa rendernya
            if (emptyState)    emptyState.style.display    = 'block';
            if (tableWrapper)  tableWrapper.style.display  = 'none';
            if (btnHapusSemua) btnHapusSemua.style.display = 'none';
            return; // hentikan langkah dan keluar
        }

        if (emptyState)    emptyState.style.display    = 'none';
        if (tableWrapper)  tableWrapper.style.display  = 'block';
        if (btnHapusSemua) btnHapusSemua.style.display = 'inline-block';

        tbody.innerHTML = '';
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const tr = document.createElement('tr');
            const nilaiKolom = [
                String(i + 1),
                String(item.nama || ''),
                String(item.produk || ''),
                String(item.jumlah || '0') + ' kg',
                String(item.pengiriman || ''),
                String(item.pembayaran || ''),
                formatTanggal(item.tanggal)
            ];

            nilaiKolom.forEach(function (nilai, index) {
                const td = document.createElement('td');
                td.textContent = nilai;
                if (index === 3) td.classList.add('quantity-cell');
                if (index === 1 && item.telepon) {
                    const telepon = document.createElement('span');
                    telepon.className = 'table-subtext';
                    telepon.textContent = String(item.telepon);
                    td.appendChild(document.createElement('br'));
                    td.appendChild(telepon);
                }
                tr.appendChild(td);
            });

            const actionCell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'btn-edit';
            editButton.dataset.id = String(item.id);
            editButton.textContent = 'Edit';
            editButton.setAttribute('aria-label', 'Edit pesanan ' + String(item.nama || ''));

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'btn-hapus';
            deleteButton.dataset.id = String(item.id);
            deleteButton.textContent = 'Hapus';
            deleteButton.setAttribute('aria-label', 'Hapus pesanan ' + String(item.nama || ''));

            actionCell.appendChild(editButton);
            actionCell.appendChild(document.createTextNode(' '));
            actionCell.appendChild(deleteButton);
            tr.appendChild(actionCell);
            tbody.appendChild(tr); 
        }

        const btnEdit = document.querySelectorAll('.btn-edit');
        btnEdit.forEach(function (btn) {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                window.location.href = 'pesan.html?edit=' + id; 
            });
        });

        const btnHapus = document.querySelectorAll('.btn-hapus');
        btnHapus.forEach(function (btn) {
            btn.addEventListener('click', function () {
                const id = Number(this.getAttribute('data-id'));
                if (confirm('Hapus pesanan ini selamanya?')) {
                    let data = getData();
                    data = data.filter(function (item) {
                        return item.id !== id;
                    });
                    if (saveData(data)) renderTable();
                }
            });
        });
    }
}

function initMobileNavigation() {
    const menuButton = document.querySelector('.hamburger');
    const menu = document.querySelector('.nav-menu');
    if (!menuButton || !menu) return;

    menuButton.addEventListener('click', function () {
        const isOpen = menu.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', String(isOpen));
    });

    menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            menu.classList.remove('open');
            menuButton.setAttribute('aria-expanded', 'false');
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initMobileNavigation();
    initForm();
    initRiwayat();
});
