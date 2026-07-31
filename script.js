//===========================
// SESSION
//===========================

let SESSION_LEVEL = "";
let SESSION_ID    = "";
let SESSION_NAMA  = "";
let HP_LOGIN = "";

//====================================
// PAGINATION PEMBAYARAN
//====================================

let pembayaranData = [];
let pembayaranFilter = [];
let pembayaranPage = 1;
let pembayaranPerPage = 12;
let dataAuditTrail=[];
let auditPage = 1;
let auditPerPage = 10;
let dataFilterAudit = [];
let DASH_MODE = "TUNGGAKAN";

function login(){

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    if(username=="" || password==""){

        document.getElementById("pesan").innerHTML="Username dan Password harus diisi";
        return;

    }

    google.script.run

    .withSuccessHandler(function(res){

        if(!res.status){

            Swal.fire({
                icon:'error',
                title:'Login Gagal',
                text:'Username atau Password salah'
            });

            return;

        }

        // Simpan Session
        SESSION_LEVEL = res.level;
        SESSION_ID    = res.id || "";
        SESSION_NAMA  = res.nama || "";

        console.log("LEVEL :", SESSION_LEVEL);
        console.log("ID    :", SESSION_ID);
        console.log("NAMA  :", SESSION_NAMA);

        // Sembunyikan Login
        document.getElementById("loginPage").style.display="none";

        // Tampilkan Dashboard
        document.getElementById("dashboardPage").style.display="block";

        //==========================
        // ADMIN
        //==========================
        if(res.level=="ADMIN"){

            tampilMenuAdmin();

        }

        //==========================
        // WARGA
        //==========================
        else{

            tampilMenuWarga();

        }

    })

    .login(username,password);

}

//==================================================
// MENU ADMIN
//==================================================

function tampilMenuAdmin(){

    document.getElementById("btnDashboard").style.display="inline-block";
    document.getElementById("btnWarga").style.display="inline-block";
    document.getElementById("btnPembayaran").style.display="inline-block";
    document.getElementById("btnTools").style.display="inline-block";

    refreshBadgeReset();

    menuDashboard();

}

//==================================================
// MENU WARGA
//==================================================

function tampilMenuWarga(){

    document.getElementById("btnDashboard").style.display="inline-block";

    document.getElementById("btnWarga").style.display="none";
    document.getElementById("btnPembayaran").style.display="none";
    document.getElementById("btnTools").style.display="none";

    dashboardWarga();

}

//==================================================
// SET MENU AKTIF
//==================================================

function setMenuAktif(menu){

    const tombol = [
        "btnDashboard",
        "btnWarga",
        "btnPembayaran",
        "btnTools"
    ];

    // HAPUS STATUS AKTIF SEMUA TOMBOL
    tombol.forEach(function(id){

        const el = document.getElementById(id);

        if(el){
            el.classList.remove("menuAktif");
        }

    });


    // TENTUKAN TOMBOL AKTIF
    let idAktif = "";

    if(menu == "dashboard"){
        idAktif = "btnDashboard";
    }

    else if(menu == "warga"){
        idAktif = "btnWarga";
    }

    else if(menu == "pembayaran"){
        idAktif = "btnPembayaran";
    }

    else if(menu == "tools"){
        idAktif = "btnTools";
    }


    // AKTIFKAN
    const aktif =
        document.getElementById(idAktif);

    if(aktif){
        aktif.classList.add("menuAktif");
    }

}

function loadDashboard(){

    //==================================================
    // AMBIL FILTER DASHBOARD
    //==================================================

    let bulan = document.getElementById("dashBulan")
              ? document.getElementById("dashBulan").value
              : "";

    let tahun = document.getElementById("dashTahun")
              ? document.getElementById("dashTahun").value
              : "";

    let mode = document.getElementById("dashMode")
             ? document.getElementById("dashMode").value
             : DASH_MODE;

    DASH_MODE = mode;


    //==================================================
    // AMBIL DATA DARI SERVER
    //==================================================

    google.script.run

    .withSuccessHandler(function(res){

        let html = "";

        const bulanList = [
            "Januari","Februari","Maret","April",
            "Mei","Juni","Juli","Agustus",
            "September","Oktober","November","Desember"
        ];

        const singkat = [
            "JAN","FEB","MAR","APR",
            "MEI","JUN","JUL","AGU",
            "SEP","OKT","NOV","DES"
        ];


        //==================================================
        // BATAS TUNGGAKAN DARI SERVER
        //==================================================

        const indexBatasTunggakan =
            Number(res.indexBatasTunggakan);


        //==================================================
        // PERIODE + RESUME TUNGGAKAN
        // SATU CARD
        //==================================================

        html += "<div class='card'>";

        html += "<div class='dashboardTopArea'>";


        //==================================================
        // BAGIAN KIRI - FILTER
        //==================================================

        html += "<div class='dashboardFilterArea'>";

        html += "<b>📅 Periode Dashboard</b><br><br>";

        html += "<select id='dashBulan' onchange='loadDashboard()'>";

        bulanList.forEach(function(b){

            html += "<option " +
                    (b == res.bulan ? "selected" : "") +
                    ">" + b + "</option>";

        });

        html += "</select>";

        html += "&nbsp;&nbsp;";

        html += "<select id='dashTahun' onchange='loadDashboard()'>";

        for(let y = 2024; y <= 2035; y++){

            html += "<option " +
                    (String(y) == String(res.tahun) ? "selected" : "") +
                    ">" + y + "</option>";

        }

        html += "</select>";


        //==================================================
        // PILIHAN TAMPILAN
        //==================================================

        html += "<br><br>";

        html += "<b>👥 Tampilkan</b><br><br>";

        html += "<select id='dashMode' ";
        html += "onchange='ubahModeDashboard(this.value)'>";

        html += "<option value='TUNGGAKAN' " +
                (DASH_MODE == "TUNGGAKAN" ? "selected" : "") +
                ">Warga Menunggak</option>";

        html += "<option value='SEMUA' " +
                (DASH_MODE == "SEMUA" ? "selected" : "") +
                ">Semua Warga</option>";

        html += "</select>";

        html += "</div>";


        //==================================================
        // BAGIAN KANAN - RESUME TUNGGAKAN
        //==================================================

        html += "<div class='dashboardResumeArea'>";

        html += "<div class='resumeTunggakanJudulUtama'>";

        html += "📌 RESUME TUNGGAKAN";

        if(res.bulanBatasTunggakan){

            html += " s.d. ";
            html += res.bulanBatasTunggakan.toUpperCase();
            html += " ";
            html += res.tahun;

        }

        html += "</div>";


        //==================================================
        // GRID 3 RESUME
        //==================================================

        html += "<div class='resumeTunggakanGrid'>";


        //================================================
        // TOTAL WARGA MENUNGGAK
        //================================================

        html += "<div class='resumeTunggakanItem'>";

        html += "<div class='resumeTunggakanJudul'>";
        html += "👥 Total Warga<br>Menunggak";
        html += "</div>";

        html += "<div class='resumeTunggakanNilai'>";
        html += Number(res.totalWargaMenunggak || 0);
        html += "</div>";

        html += "<div class='resumeTunggakanSatuan'>";
        html += "Warga";
        html += "</div>";

        html += "</div>";


        //================================================
        // TOTAL BULAN TUNGGAKAN
        //================================================

        html += "<div class='resumeTunggakanItem'>";

        html += "<div class='resumeTunggakanJudul'>";
        html += "📅 Total Bulan<br>Tunggakan";
        html += "</div>";

        html += "<div class='resumeTunggakanNilai'>";
        html += Number(res.totalBulanTunggakan || 0);
        html += "</div>";

        html += "<div class='resumeTunggakanSatuan'>";
        html += "Bulan";
        html += "</div>";

        html += "</div>";


        //================================================
        // TOTAL NOMINAL TUNGGAKAN
        //================================================

        html += "<div class='resumeTunggakanItem'>";

        html += "<div class='resumeTunggakanJudul'>";
        html += "💰 Total Nominal<br>Tunggakan";
        html += "</div>";

        html += "<div class='resumeTunggakanNilai resumeTunggakanNominal'>";

        html += "Rp " +
                Number(
                    res.totalNominalTunggakan || 0
                ).toLocaleString("id-ID");

        html += "</div>";

        html += "<div class='resumeTunggakanSatuan'>";
        html += "&nbsp;";
        html += "</div>";

        html += "</div>";


        //==================================================
        // TUTUP GRID RESUME
        //==================================================

        html += "</div>";

        html += "</div>";


        //==================================================
        // TUTUP TOP AREA + CARD
        //==================================================

        html += "</div>";

        html += "</div>";

        html += "<br>";


        //==================================================
        // SUMMARY DASHBOARD
        //==================================================

        html += "<div class='dashboardGrid'>";


        // WARGA AKTIF
        html += "<div class='dashCard'>";

        html += "<div class='dashTitle'>";
        html += "👥 Warga Aktif";
        html += "</div>";

        html += "<div class='dashValue'>";
        html += res.wargaAktif;
        html += "</div>";

        html += "</div>";


        // SUDAH BAYAR
        html += "<div class='dashCard'>";

        html += "<div class='dashTitle'>";
        html += "💰 Sudah Bayar";
        html += "</div>";

        html += "<div class='dashValue'>";
        html += res.bayarBulanIni;
        html += "</div>";

        html += "</div>";


        // KAS
        html += "<div class='dashCard'>";

        html += "<div class='dashTitle'>";
        html += "💵 Kas " + res.bulan + " " + res.tahun;
        html += "</div>";

        html += "<div class='dashValue'>";
        html += "Rp " +
                Number(res.kasMasuk).toLocaleString("id-ID");
        html += "</div>";

        html += "</div>";


        // BELUM BAYAR
        html += "<div class='dashCard'>";

        html += "<div class='dashTitle'>";
        html += "⚠ Belum Bayar";
        html += "</div>";

        html += "<div class='dashValue'>";
        html += res.belumBayar;
        html += "</div>";

        html += "</div>";


        html += "</div>";

        html += "<br>";


        //==================================================
        // DATA YANG DITAMPILKAN
        //==================================================

        let dataTampil = [];

        if(DASH_MODE == "SEMUA"){

            dataTampil = res.semuaWarga || [];

        }else{

            dataTampil = res.tunggakan || [];

        }


        //==================================================
        // CARD DATA
        //==================================================

        html += "<div class='card'>";

        html += "<h3>";


        if(DASH_MODE == "SEMUA"){

            html += "📋 Status Pembayaran Warga";

        }else{

            html += "📋 Daftar Tunggakan";

        }


        //==================================================
        // JUDUL BATAS TUNGGAKAN
        //==================================================

        if(res.bulanBatasTunggakan){

            html += " s.d. ";
            html += res.bulanBatasTunggakan;
            html += " ";
            html += res.tahun;

        }

        html += "</h3>";


        //==================================================
        // DATA KOSONG
        //==================================================

        if(dataTampil.length == 0){

            if(DASH_MODE == "TUNGGAKAN"){

                html += "<p>";

                html += "Semua warga sudah membayar sampai dengan ";

                html += res.bulanBatasTunggakan + " " + res.tahun + ".";

                html += "</p>";

            }else{

                html += "<p>Belum ada data warga.</p>";

            }

        }


        //==================================================
        // ADA DATA
        //==================================================

        else{

            html += "<div style='overflow-x:auto;'>";

            html += "<table class='tbl'>";

            html += "<thead>";


            //================================================
            // HEADER UTAMA
            //================================================

            html += "<tr>";

            html += "<th width='60' rowspan='2'>NO.</th>";

            html += "<th width='100' rowspan='2'>ID</th>";

            html += "<th width='220' rowspan='2'>NAMA</th>";

            html += "<th colspan='12'>";
            html += "PROGRESS  PEMBAYARAN";
            html += "</th>";

            html += "<th width='190' rowspan='2'>STATUS</th>";

            html += "</tr>";


            //================================================
            // HEADER BULAN
            //================================================

            html += "<tr class='headerBulanDashboard'>";

            for(let b = 0; b < 12; b++){

                html += "<th>" + singkat[b] + "</th>";

            }

            html += "</tr>";

            html += "</thead>";

            html += "<tbody>";


            //================================================
            // LOOP WARGA
            //================================================

            dataTampil.forEach(function(w,i){

                html += "<tr>";


                // NO
                html += "<td align='center'>";
                html += (i + 1);
                html += "</td>";


                // ID
                html += "<td>";
                html += w.id;
                html += "</td>";


                // NAMA
                html += "<td>";
                html += w.nama;
                html += "</td>";


                let jumlahNunggak = 0;

                let bulanTerakhirBayar = "";


                //================================================
                // CARI BULAN PEMBAYARAN TERAKHIR
                //================================================

                if(
                    w.bulanBayar &&
                    w.bulanBayar.length > 0
                ){

                    for(let b = 11; b >= 0; b--){

                        if(
                            w.bulanBayar.includes(
                                bulanList[b]
                            )
                        ){

                            bulanTerakhirBayar =
                                bulanList[b];

                            break;

                        }

                    }

                }


                //================================================
                // PROGRESS JANUARI - DESEMBER
                //================================================

                for(let b = 0; b < 12; b++){

                    html += "<td align='center' ";
                    html += "class='progressCell'>";


                    // SUDAH DIBAYAR
                    if(
                        w.bulanBayar &&
                        w.bulanBayar.includes(
                            bulanList[b]
                        )
                    ){

                        html +=
                        "<div class='progressBox progressLunas'></div>";

                    }


                    // BELUM BAYAR DAN SUDAH JATUH TEMPO
                    else if(
                        b <= indexBatasTunggakan
                    ){

                        jumlahNunggak++;

                        html +=
                        "<div class='progressBox progressNunggak'></div>";

                    }


                    // BELUM JATUH TEMPO
                    else{

                        html +=
                        "<div class='progressBox progressFuture'></div>";

                    }


                    html += "</td>";

                }


                //================================================
                // STATUS
                //================================================

                html += "<td align='center'>";

                let warna = "#28a745";


                if(jumlahNunggak >= 4){

                    warna = "#dc3545";

                }
                else if(jumlahNunggak >= 2){

                    warna = "#fd7e14";

                }
                else if(jumlahNunggak == 1){

                    warna = "#ffc107";

                }


                html += "<span class='badgeNunggak' ";
                html += "style='background:" + warna + "'>";


                if(jumlahNunggak == 0){

                    if(bulanTerakhirBayar != ""){

                        html +=
                        "Lunas s.d. " +
                        bulanTerakhirBayar;

                    }else{

                        html += "Belum Ada Pembayaran";

                    }

                }

                else if(jumlahNunggak == 1){

                    html += "Tunggakan 1 Bulan";

                }

                else{

                    html +=
                    "Tunggakan " +
                    jumlahNunggak +
                    " Bulan";

                }


                html += "</span>";

                html += "</td>";

                html += "</tr>";

            });


            //================================================
            // TUTUP TABLE
            //================================================

            html += "</tbody>";

            html += "</table>";

            html += "</div>";

        }


        //==================================================
        // TUTUP CARD
        //==================================================

        html += "</div>";


        //==================================================
        // TAMPILKAN
        //==================================================

        document.getElementById("content").innerHTML = html;

    })


    //==================================================
    // PANGGIL SERVER
    //==================================================

    .dashboardDetail(bulan,tahun);

}

function ubahModeDashboard(mode){

    DASH_MODE = mode;

    loadDashboard();

}

function menuSetting(){

    aktifkanMenu("setting");

    let html="";

    html+="<div class='card'>";

    html+="<h2>⚙️ Pengaturan SIWARGA</h2>";

    html+="<br>";

    html+="<table class='tbl'>";

    html+="<tr>";
    html+="<td width='180'><b>Logo RT</b></td>";
    html+="<td>";

    html+="<input type='file' id='fileLogo' accept='image/*' onchange='previewLogo()'>";

    html+="</td>";
    html+="</tr>";

    html+="<tr>";
    html+="<td>Preview</td>";
    html+="<td>";

    html+="<img id='previewLogo' style='max-width:180px;display:none;border:1px solid #ccc;padding:5px;'>";

    html+="</td>";
    html+="</tr>";

    html+="<tr>";
    html+="<td></td>";
    html+="<td>";

    html+="<button onclick='simpanLogo()'>💾 Simpan Logo</button>";

    html+="</td>";
    html+="</tr>";

    html+="</table>";

    html+="</div>";

    document.getElementById("content").innerHTML=html;

}

function previewLogo(){

    const file = document.getElementById("fileLogo").files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        const img = document.getElementById("previewLogo");

        img.src = e.target.result;

        img.style.display = "block";

    };

    reader.readAsDataURL(file);

}

function simpanLogo(){

    const file = document.getElementById("fileLogo").files[0];

    if(!file){

        Swal.fire(
            "Pilih logo terlebih dahulu",
            "",
            "warning"
        );

        return;

    }

    const reader = new FileReader();

    reader.onload = function(e){

        const img = new Image();

        img.onload = function(){

            // ukuran maksimum logo
            const MAX_WIDTH = 250;

            let width  = img.width;
            let height = img.height;

            if(width > MAX_WIDTH){

                height = height * (MAX_WIDTH / width);
                width  = MAX_WIDTH;

            }

            const canvas = document.createElement("canvas");

            canvas.width  = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");

            ctx.drawImage(img,0,0,width,height);

            // JPEG kualitas 80%
            const base64 = canvas.toDataURL("image/jpeg",0.8);

            console.log("Ukuran Base64 :",base64.length);

            google.script.run

            .withSuccessHandler(function(){

                Swal.fire({

                    icon:"success",

                    title:"Berhasil",

                    text:"Logo berhasil disimpan."

                });

            })

            .withFailureHandler(function(err){

                Swal.fire({

                    icon:"error",

                    title:"Gagal",

                    text:err.message

                });

            })

            .simpanLogoSetting(base64);

        };

        img.src = e.target.result;

    };

    reader.readAsDataURL(file);

}

function loadLogoLogin(){

    google.script.run

    .withSuccessHandler(function(base64){

        if(!base64) return;

        const img = document.getElementById("logoLogin");

        img.src = base64;

        img.style.display = "block";

    })

    .getLogoLogin();

}

window.onload = function(){

    loadLogoLogin();

};

//==================================================
// DASHBOARD WARGA
//==================================================

function dashboardWarga(){

    google.script.run

    .withSuccessHandler(function(res){

        let html = "";


        //==================================================
        // WRAPPER DASHBOARD
        //==================================================

        html += "<div class='wargaDashboardPage'>";

        html += "<h2 class='wargaDashboardTitle'>";
        html += "👋 Dashboard Warga";
        html += "</h2>";


        //==================================================
        // LAYOUT KIRI - KANAN
        //==================================================

        html += "<div class='wargaDashboardLayout'>";


        //==================================================
        // BAGIAN KIRI
        //==================================================

        html += "<div class='wargaDashboardKiri'>";


        //==================================================
        // PROFIL
        //==================================================

        html += "<div class='card wargaProfilCard'>";

        html += "<div class='dashTitle'>";
        html += "👤 Selamat Datang";
        html += "</div>";

        html += "<div class='wargaNama'>";
        html += res.nama;
        html += "</div>";

        html += "<div class='wargaIdentitas'>";

        html += "ID : <b>" + res.id + "</b><br>";

        html += "Status : <b>" + res.level + "</b>";

        html += "<div style='margin-top:18px;'>";

        html += "<button ";
        html += "type='button' ";
        html += "onclick='formUbahPasswordWarga()' ";
        html += "class='btnUbahPasswordWarga'>";

        html += "🔐 Ubah Password";

        html += "</button>";

        html += "</div>";

        html += "</div>";

        html += "</div>";

        //==================================================
        // TAGIHAN BULAN INI
        //==================================================

        html += "<div class='card wargaMiniCard'>";

        html += "<div class='dashTitle'>";
        html += "💰 Tagihan Bulan Ini";
        html += "</div>";

        html += "<div class='wargaNominal'>";

        html += "Rp " +
        Number(res.tagihan).toLocaleString("id-ID");

        html += "</div>";


        //==================================================
        // KETERANGAN BEBAS IURAN
        //==================================================

        if(res.bebasIuran){

            html += "<div class='wargaBebasIuran'>";

            html += "✓ Bebas Iuran — ";

            html += res.alasanBebas || "Pengurus";

            html += "</div>";

        }

        //==================================================
        // TUTUP CARD TAGIHAN
        //==================================================

        html += "</div>";

        //==================================================
        // STATUS + TUNGGAKAN
        //==================================================

        html += "<div class='card wargaStatusCard'>";

        html += "<div class='dashTitle'>";
        html += "📌 Status";
        html += "</div>";


        //==================================================
        // JIKA TIDAK ADA TUNGGAKAN
        //==================================================

        if(
            !res.jumlahTunggakan ||
            Number(res.jumlahTunggakan) === 0
        ){

            html += "<div class='statusLunasWarga'>";

            html += "✓ LUNAS";

            html += "</div>";


            html += "<div class='wargaStatusKeterangan'>";

            html += "Pembayaran sampai dengan ";

            html += "<b>" +
                res.bulan +
                " " +
                res.tahun +
                "</b>";

            html += " sudah lunas.";

            html += "</div>";

        }


        //==================================================
        // JIKA ADA TUNGGAKAN
        //==================================================

        else{

            html += "<div class='statusBelumWarga'>";

            html += "✕ BELUM BAYAR";

            html += "</div>";


            //==============================================
            // DETAIL TUNGGAKAN
            //==============================================

            html += "<div class='wargaTunggakanDetail'>";


            // JUMLAH BULAN
            html += "<div class='wargaTunggakanRow'>";

            html += "<span>⚠️ Tunggakan</span>";

            html += "<b>";

            html += res.jumlahTunggakan;

            html += " Bulan";

            html += "</b>";

            html += "</div>";


            // BULAN YANG BELUM DIBAYAR
            html += "<div class='wargaTunggakanRow'>";

            html += "<span>📅 Bulan</span>";

            html += "<b>";

            html +=
                (res.bulanTunggakan || []).join(", ");

            html += "</b>";

            html += "</div>";


            // TOTAL TUNGGAKAN
            html += "<div class='wargaTunggakanRow'>";

            html += "<span>💰 Total</span>";

            html += "<b class='wargaTotalTunggakan'>";

            html += "Rp " +
                Number(res.totalTunggakan || 0)
                .toLocaleString("id-ID");

            html += "</b>";

            html += "</div>";


            html += "</div>";

        }


        html += "</div>";


        //==================================================
        // PERIODE
        //==================================================

        html += "<div class='card wargaMiniCard'>";

        html += "<div class='dashTitle'>";
        html += "🗓️ Periode";
        html += "</div>";

        html += "<div class='wargaPeriode'>";

        html += res.bulan + " " + res.tahun;

        html += "</div>";

        html += "</div>";


        //==================================================
        // TUTUP BAGIAN KIRI
        //==================================================

        html += "</div>";


        //==================================================
        // BAGIAN KANAN
        // RIWAYAT PEMBAYARAN
        //==================================================

        html += "<div class='card wargaDashboardKanan'>";

        html += "<h2 class='riwayatTitle'>";
        html += "📜 Riwayat Pembayaran";
        html += "</h2>";


        //==================================================
        // TABEL DESKTOP
        //==================================================

        html += "<div class='riwayatDesktop'>";

        html += "<table class='tbl'>";

        html += "<thead>";

        html += "<tr>";

        html += "<th>No</th>";
        html += "<th>Tanggal</th>";
        html += "<th>Bulan</th>";
        html += "<th>Jumlah</th>";
        html += "<th>Status</th>";

        html += "</tr>";

        html += "</thead>";

        html += "<tbody>";


        //==================================================
        // BELUM ADA RIWAYAT
        //==================================================

        if(
            !res.riwayat ||
            res.riwayat.length === 0
        ){

            html += "<tr>";

            html += "<td colspan='5' align='center'>";

            html += "Belum ada pembayaran";

            html += "</td>";

            html += "</tr>";

        }


        //==================================================
        // ADA RIWAYAT
        //==================================================

        else{

            res.riwayat.forEach(function(r,i){

                html += "<tr>";

                html +=
                    "<td align='center'>" +
                    (i + 1) +
                    "</td>";

                html +=
                    "<td>" +
                    r.tanggal +
                    "</td>";

                html +=
                    "<td>" +
                    r.bulan +
                    "</td>";

                html +=
                    "<td align='right'>";

                html +=
                    "Rp " +
                    Number(r.jumlah)
                    .toLocaleString("id-ID");

                html += "</td>";


                //==========================================
                // STATUS PEMBAYARAN
                //==========================================

                html += "<td>";

                html += "<span class='badgeLunasWarga'>";

                html += r.status || "Lunas";

                html += "</span>";

                html += "</td>";


                html += "</tr>";

            });

        }


        html += "</tbody>";

        html += "</table>";

        html += "</div>";


        //==================================================
        // RIWAYAT MOBILE
        //==================================================

        html += "<div class='riwayatMobile'>";


        if(
            !res.riwayat ||
            res.riwayat.length === 0
        ){

            html += "<div class='riwayatMobileKosong'>";

            html += "Belum ada pembayaran";

            html += "</div>";

        }

        else{

            res.riwayat.forEach(function(r){

                html += "<div class='riwayatMobileCard'>";


                html += "<div class='riwayatTanggal'>";

                html += "📅 " + r.tanggal;

                html += "</div>";


                html += "<div class='riwayatMobileRow'>";

                html += "<span>Periode</span>";

                html += "<b>" +
                    r.bulan +
                    "</b>";

                html += "</div>";


                html += "<div class='riwayatMobileRow'>";

                html += "<span>Jumlah</span>";

                html += "<b>";

                html +=
                    "Rp " +
                    Number(r.jumlah)
                    .toLocaleString("id-ID");

                html += "</b>";

                html += "</div>";


                html += "<div class='riwayatMobileRow'>";

                html += "<span>Status</span>";

                html += "<b>";

                html += r.status || "Lunas";

                html += "</b>";

                html += "</div>";


                html += "</div>";

            });

        }


        html += "</div>";


        //==================================================
        // TUTUP KANAN
        //==================================================

        html += "</div>";


        //==================================================
        // TUTUP LAYOUT
        //==================================================

        html += "</div>";

        html += "</div>";


        //==================================================
        // TAMPILKAN
        //==================================================

        document.getElementById("content").innerHTML = html;

    })


    //==================================================
    // JIKA SERVER ERROR
    //==================================================

    .withFailureHandler(function(err){

        Swal.fire({

            icon:"error",

            title:"Dashboard Error",

            text:
                err && err.message
                ? err.message
                : "Dashboard warga gagal dimuat."

        });

    })


    //==================================================
    // PANGGIL SERVER
    //==================================================

    .dashboardWarga(SESSION_ID);

}

function logout(){

    google.script.run

    .withSuccessHandler(function(){

        document.getElementById("dashboardPage").style.display="none";
        document.getElementById("loginPage").style.display="flex";

        document.getElementById("username").value="";
        document.getElementById("password").value="";

        // Bersihkan session browser
        SESSION_LEVEL = "";
        SESSION_ID    = "";
        SESSION_NAMA  = "";

        HP_LOGIN = "";

        kembaliAwal();

    })

    .withFailureHandler(function(err){

        Swal.fire({
            icon:"error",
            title:"Logout Gagal",
            text:err.message
        });

    })

    .logoutUser(
        SESSION_LEVEL,
        SESSION_ID,
        SESSION_NAMA,
        HP_LOGIN
    );

}

//==================================================
// ENTER UNTUK LOGIN
//==================================================

document.addEventListener("keydown", function(e){

    if(e.key !== "Enter"){
        return;
    }


    //================================================
    // LOGIN WARGA - PASSWORD
    //================================================

    const passwordWarga =
        document.getElementById("passwordWarga");

    if(
        passwordWarga &&
        passwordWarga.offsetParent !== null
    ){

        e.preventDefault();

        loginWarga();

        return;

    }


    //================================================
    // LOGIN WARGA - NOMOR HP
    //================================================

    const hpLogin =
        document.getElementById("hpLogin");

    if(
        hpLogin &&
        hpLogin.offsetParent !== null
    ){

        e.preventDefault();

        cekLoginWarga();

        return;

    }



    //================================================
    // LOGIN ADMIN
    //================================================

    const username =
        document.getElementById("username");

    const password =
        document.getElementById("password");

    if(
        username &&
        password &&
        username.offsetParent !== null
    ){

        e.preventDefault();

        login();

        return;

    }

});

function menuDashboard(){

    setMenuAktif("dashboard");

    aktifkanMenu("dashboard");

    if(SESSION_LEVEL=="ADMIN"){

        loadDashboard();

    }else{

        dashboardWarga();

    }

}



//==================================================
// DATA WARGA
//==================================================

function menuWarga(){

    setMenuAktif("warga");

    aktifkanMenu("warga");

    document.getElementById("content").innerHTML="Loading...";

    google.script.run

    .withSuccessHandler(function(data){

        try{

          dataWarga = data;

          dataFilter = [...data];

          wargaCurrentPage = 1;

          renderDataWarga();

        }catch(e){

          console.error(e);

          Swal.fire({
            icon:"error",
            title:"JavaScript Error",
            text:e.message
          });

        }

    })

    .withFailureHandler(function(err){

        Swal.fire({

            icon:"error",

            title:"Gagal memuat Data Warga",

            text:err.message

        });

    })

    .getWarga();

}

function renderDataWarga(){

    let total = dataFilter.length;

    let html="";

    html+="<div class='card'>";

    //----------------------------
    // Toolbar
    //----------------------------

    html+="<div class='toolbar'>";

    html+="<div class='left-toolbar'>";

    html+="<button class='btnTambah' onclick='formTambahWarga()'>";
    html+="➕ Tambah Warga";
    html+="</button>";

    html+="<button id='btnNonaktifkan' ";
    html+="class='btnNonaktifkan' ";
    html+="onclick='hapusMassalWarga()' ";
    html+="style='display:none'>";
    html+="🚫 Nonaktifkan (0)";
    html+="</button>";

    html+="<input ";
    html+="id='txtCariWarga' ";
    html+="class='search' ";
    html+="placeholder='Cari Nama / ID' ";
    html+="onkeyup='cariWarga()'>";

    html+="<span style='margin-left:15px'>Tampilkan</span>";

    html+="<select ";
    html+="id='RowsPerPage' ";
    html+="onchange='ubahRowsPerPage()' ";
    html+="style='margin-left:5px;height:36px'>";

    html+="<option value='10'>10</option>";
    html+="<option value='20'>20</option>";
    html+="<option value='50'>50</option>";
    html+="<option value='100'>100</option>";
    html+="<option value='99999'>Semua</option>";

    html+="</select>";

    html+="</div>";

    html+="<div>";
    html+="Total : <b>"+total+"</b> Warga";
    html+="</div>";

    html+="</div>";

    //----------------------------
    // Tempat tabel
    // SCROLL HORIZONTAL HP
    //----------------------------

    html+="<div ";
    html+="style='";
    html+="width:100%;";
    html+="max-width:100%;";
    html+="overflow-x:auto;";
    html+="overflow-y:hidden;";
    html+="-webkit-overflow-scrolling:touch;";
    html+="touch-action:pan-x pan-y;";
    html+="'>";

    html+="<div id='tblWarga' style='min-width:900px;'></div>";

    html+="</div>";

    html+="</div>";

    document.getElementById("content").innerHTML = html;

    document.getElementById("RowsPerPage").value =
        wargaRowsPerPage >= dataFilter.length
        ? "99999"
        : wargaRowsPerPage;

    document.getElementById("tblWarga").innerHTML =
        renderTabelWarga(dataFilter);

}


function renderTabelWarga(data){

    let html="";

    const totalData = data.length;

    let pageSize = wargaRowsPerPage;

    let totalHalaman =
    Math.ceil(totalData/pageSize);

    if(totalHalaman<1) totalHalaman=1;

    // Perbaikan: Validasi halaman agar tidak melebihi total halaman baru
    if(wargaCurrentPage > totalHalaman) wargaCurrentPage = totalHalaman;
    if(wargaCurrentPage < 1) wargaCurrentPage = 1;

    const awal  = (wargaCurrentPage-1) * pageSize;
    const akhir = Math.min(awal + pageSize, totalData);

    html += "<table class='tbl'>";
    html += "<thead>";
    html += "<tr>";

    html += "<th width='35'><input type='checkbox' id='cekSemua' onclick='cekSemuaWarga()'></th>";
    html += "<th width='40'>No</th>";
    html += "<th width='60'>ID</th>";
    html += "<th>Nama</th>";
    html += "<th width='220'>Alamat</th>";
    html += "<th width='170'>No HP</th>";
    html += "<th width='60'>WA</th>";
    html += "<th width='120'>Status</th>";
    html += "<th width='90'>Aksi</th>";

    html += "</tr>";
    html += "</thead>";
    html += "<tbody>";

    for(let i=awal;i<akhir;i++){

        html+="<tr>";

        html+="<td align='center'><input type='checkbox' class='cekWarga' value='"+data[i][0]+"' onchange='hitungChecklist()'></td>";

        html+="<td align='center'>"+(i+1)+"</td>";

        html+="<td>"+data[i][0]+"</td>";
        html+="<td>"+data[i][1]+"</td>";
        html+="<td>"+data[i][2]+"</td>";
        html+="<td>"+data[i][3]+"</td>";

        if(data[i][3]!=""){

            html+="<td align='center'>";
            html+="<a href='https://wa.me/62"+data[i][3].substring(1)+"' target='_blank'>🟢</a>";
            html+="</td>";

        }else{

            html+="<td align='center'>-</td>";

        }

        html+="<td>"+data[i][4]+"</td>";

        html+="<td align='center'>";
        html+="<button class='btnEdit' onclick=\"editWarga('"+data[i][0]+"')\">✏️</button> ";
        html+="<button class='btnHapus' onclick=\"hapusWarga('"+data[i][0]+"')\">🚫</button>";
        html+="</td>";

        html+="</tr>";

    }

    html+="</tbody>";
    html+="</table>";

    html+="<div class='paging'>";

    html+="<div>";
    html+="Menampilkan <b>"+(totalData==0?0:awal+1)+"</b> - ";
    html+="<b>"+akhir+"</b> dari <b>"+totalData+"</b> warga";
    html+="</div>";

    html+="<div>";

    html+="<button class='btnPaging' ";
    if(wargaCurrentPage==1) html+="disabled ";
    html+="onclick='prevPage()'>◀ Prev</button>";

    html+="&nbsp;&nbsp;";

    html+="<b>Halaman "+wargaCurrentPage+" / "+totalHalaman+"</b>";

    html+="&nbsp;&nbsp;";

    html+="<button class='btnPaging' ";
    if(wargaCurrentPage>=totalHalaman) html+="disabled ";
    html+="onclick='nextPage()'>Next ▶</button>";

    html+="</div>";

    html+="</div>";

    return html;

}

function nextPage(){

    let pageSize = wargaRowsPerPage;

    console.log("Page :", wargaCurrentPage);
    console.log("Rows :", wargaRowsPerPage);
    console.log("Filter :", dataFilter.length);    

    const totalHalaman =
        Math.max(1,
        Math.ceil(dataFilter.length/pageSize));

    if(wargaCurrentPage<totalHalaman){

        wargaCurrentPage++;

        document.getElementById("tblWarga").innerHTML =
            renderTabelWarga(dataFilter);

            console.log("Sesudah Render :", dataFilter.length);

    }

}

function prevPage(){

    if(wargaCurrentPage>1){

        wargaCurrentPage--;

        document.getElementById("tblWarga").innerHTML =
            renderTabelWarga(dataFilter);

    }

}

function formTambahWarga(){

    aktifkanMenu("warga");

    let html="";

    html+="<div class='card'>";

    html+="<h3 style='text-align:center'>Tambah Data Warga</h3>";

    html+="<div class='formGrid'>";

    html+="<label>ID Warga</label>";
    html+="<input id='id' readonly>";

    html+="<label>Nama</label>";
    html+="<input id='nama' placeholder='Nama Warga'>";

    html+="<label>Alamat</label>";
    html+="<input id='alamat' placeholder='Contoh : CHERRY 2'>";

    html+="<label>No HP</label>";
    html+="<input id='nohp' placeholder='08xxxxxxxxxx' onblur='formatNoHP()'>";

    html+="<label>Status</label>";

    html+="<select id='status'>";

    html+="<option value='WARGA'>WARGA</option>";

    html+="<option value='KETUA RT'>KETUA RT</option>";

    html+="<option value='SEKRETARIS'>SEKRETARIS</option>";

    html+="<option value='BENDAHARA'>BENDAHARA</option>";

    html+="</select>";

    html+="</div>";

    html+="<div class='formButton'>";

    html+="<button class='btnTambah' onclick='simpanWarga()'>💾 Simpan</button>";

    html+="&nbsp;&nbsp;";

    html+="<button class='btnBatal' onclick='menuWarga()'>Batal</button>";

    html+="</div>";

    html+="</div>";

    document.getElementById("content").innerHTML=html;

    google.script.run
    .withSuccessHandler(function(id){

        document.getElementById("id").value=id;

    })
    .getNextIdWarga();

}

function simpanWarga(){

    formatNoHP();

    let id      = document.getElementById("id").value.trim().toUpperCase();
    let nama    = document.getElementById("nama").value.trim().toUpperCase();
    let alamat  = document.getElementById("alamat").value.trim().toUpperCase();
    let nohp    = document.getElementById("nohp").value.trim();
    let status  = document.getElementById("status").value;

    // Validasi
    if(id==""){

        Swal.fire({
            icon:"warning",
            title:"ID Warga belum diisi"
        });

        return;

    }

    if(nama==""){

        Swal.fire({
            icon:"warning",
            title:"Nama Warga belum diisi"
        });

        return;

    }

    if(alamat==""){

        Swal.fire({
            icon:"warning",
            title:"Alamat belum diisi"
        });

        return;

    }

    if(nohp!="" && nohp.length<10){

        Swal.fire({
            icon:"warning",
            title:"Nomor HP tidak valid"
        });

        return;

    }

    google.script.run

  .withSuccessHandler(function(){

    Swal.fire({
        icon:'success',
        title:'Berhasil',
        text:'Data warga berhasil disimpan',
        timer:1200,
        showConfirmButton:false
    });

    menuWarga();

  })

  .withFailureHandler(function(err){

    Swal.fire({
        icon:'error',
        title:'Gagal',
        text:err.message
    });

  })

  .simpanWarga(

    id,
    nama,
    alamat,
    nohp,
    status

  );
}

function cariWarga(){

    keywordCari =
        document.getElementById("txtCariWarga")
        .value
        .toLowerCase();

    dataFilter =
        dataWarga.filter(function(r){

            return (
                String(r[0]).toLowerCase().includes(keywordCari) ||
                String(r[1]).toLowerCase().includes(keywordCari) ||
                String(r[2]).toLowerCase().includes(keywordCari)
            );

        });

    wargaCurrentPage = 1;

    document.getElementById("tblWarga").innerHTML =
        renderTabelWarga(dataFilter);

}

function cekSemuaWarga(){

    let status=document.getElementById("cekSemua").checked;

    document.querySelectorAll(".cekWarga").forEach(function(c){

        c.checked=status;

    });

    hitungChecklist();

}

function hitungChecklist(){

    let jumlah = 0;

    document.querySelectorAll(".cekWarga").forEach(function(c){

        if(c.checked) jumlah++;

    });

    let btn = document.getElementById("btnNonaktifkan");

    if(jumlah==0){

        btn.style.display="none";

    }else{

        btn.style.display="inline-block";

        btn.innerHTML="🚫 Nonaktifkan ("+jumlah+")";

    }

}

function ubahRowsPerPage(){
    let v = document.getElementById("RowsPerPage").value;
    
    // Update variabel global
    if(v=="99999"){

      wargaRowsPerPage=dataFilter.length;

    }else{

      wargaRowsPerPage=parseInt(v,10);

    }
    
    // Reset ke halaman 1 setiap kali jumlah baris berubah
    wargaCurrentPage = 1;
    
    // Render ulang tabel berdasarkan data yang sudah difilter
    document.getElementById("tblWarga").innerHTML = renderTabelWarga(dataFilter);
}

function hapusMassalWarga(){

    let idList=[];

    document.querySelectorAll(".cekWarga").forEach(function(c){

        if(c.checked){

            idList.push(c.value);

        }

    });

    if(idList.length==0){

        Swal.fire({

            icon:"warning",

            title:"Belum ada data",

            text:"Silakan pilih minimal satu warga."

        });

        return;

    }

    Swal.fire({

        icon:"warning",

        title:"Nonaktifkan Warga",

        html:
        "Anda akan menonaktifkan <b>"+idList.length+
        "</b> warga.<br><br>"+
        "Data tidak dihapus dan masih bisa dipulihkan.",

        showCancelButton:true,

        confirmButtonText:"🚫 Ya, Nonaktifkan",

        cancelButtonText:"Batal",

        confirmButtonColor:"#dc3545"

    }).then(function(r){

        if(!r.isConfirmed) return;

        google.script.run

        .withSuccessHandler(function(jumlah){

            Swal.fire({

                icon:"success",

                title:"Berhasil",

                html:"<b>"+jumlah+"</b> warga berhasil dinonaktifkan.",

                timer:1800,

                showConfirmButton:false

            });

            refreshSemua("WARGA");

        })

        .hapusMassalWarga(idList);

    });

}

function hapusWarga(baris){

    Swal.fire({

        title: 'Hapus Data?',

        text: 'Data warga yang dihapus tidak dapat dikembalikan.',

        icon: 'warning',

        showCancelButton: true,

        confirmButtonColor: '#d33',

        cancelButtonColor: '#6c757d',

        confirmButtonText: '🗑️ Ya, Hapus',

        cancelButtonText: 'Batal'

    }).then((result)=>{

        if(result.isConfirmed){

            google.script.run

            .withSuccessHandler(function(){

                Swal.fire({

                    icon:'success',

                    title:'Berhasil',

                    text:'Data warga berhasil dihapus',

                    timer:1500,

                    showConfirmButton:false

                });

                refreshSemua("WARGA");

            })

            .hapusWarga(baris);

        }

    });

}

//==================================================
// FORM EDIT WARGA
//==================================================

function editWarga(id){

    aktifkanMenu("warga");

    google.script.run
    .withSuccessHandler(function(r){

        let html="";

        html+="<div class='card'>";

        html+="<h2>✏ Edit Data Warga</h2>";

        html+="<input type='hidden' id='baris' value='"+r.row+"'>";

        html+="<div class='formGrid'>";

        html+="<label>ID Warga</label>";
        html+="<input id='id' value='"+r.id+"' readonly>";

        html+="<label>Nama Warga</label>";
        html+="<input id='nama' value='"+r.nama+"' oninput='this.value=this.value.toUpperCase()'>";

        html+="<label>Alamat</label>";
        html+="<input id='alamat' value='"+r.alamat+"' oninput='this.value=this.value.toUpperCase()'>";

        html+="<label>No. HP</label>";
        html+="<input id='nohp' value='"+(r.hp||"")+"' onkeyup='formatNoHP()'>";

        html+="<label>Status</label>";

        html+="<select id='status'>";

        const statusList=[
            "WARGA",
            "KETUA RT",
            "SEKRETARIS",
            "BENDAHARA"
        ];

        statusList.forEach(function(s){

            html+="<option "+(s==r.status?"selected":"")+">"+s+"</option>";

        });

        html+="</select>";

        html+="</div>";

        html+="<div class='formButton'>";

        html+="<button class='btnTambah' onclick='updateWarga()'>💾 Update</button>";

        html+="&nbsp;&nbsp;";

        html+="<button class='btnBatal' onclick='menuWarga()'>❌ Batal</button>";

        html+="</div>";

        html+="</div>";

        document.getElementById("content").innerHTML=html;

    })

    .getWargaById(id);

}

function updateWarga(){

    let baris = document.getElementById("baris").value;
    let id = document.getElementById("id").value.trim();
    let nama = document.getElementById("nama").value.trim();
    let alamat = document.getElementById("alamat").value.trim();
    let nohp = document.getElementById("nohp").value.trim();
    let status = document.getElementById("status").value;

    if(id==""){

        Swal.fire({
            icon:'warning',
            title:'Perhatian',
            text:'ID belum diisi'
        });

        return;
    }

    if(nama==""){

        Swal.fire({
            icon:'warning',
            title:'Perhatian',
            text:'Nama belum diisi'
        });

        return;
    }

    google.script.run

    .withSuccessHandler(function(){

        Swal.fire({
            icon:'success',
            title:'Berhasil',
            text:'Perubahan data warga berhasil disimpan.',
            timer:1500,
            showConfirmButton:false
        });

        setTimeout(function(){

          refreshSemua("WARGA");

        },1500);
    })

    .withFailureHandler(function(err){

        Swal.fire({
            icon:'error',
            title:'Gagal',
            text:err.message
        });

    })

    .updateWarga(baris,id,nama,alamat,nohp,status);

}

function restore(id){

    Swal.fire({
        title:'Restore Warga?',
        text:'Data warga akan diaktifkan kembali.',
        icon:'question',
        showCancelButton:true,
        confirmButtonText:'Ya',
        cancelButtonText:'Batal'
    }).then((r)=>{

        if(!r.isConfirmed) return;

        google.script.run
        .withSuccessHandler(function(){

            Swal.fire({
              icon:'success',
              title:'Berhasil',
              text:'Data berhasil direstore',
              timer:1200,
              showConfirmButton:false
        });

    setTimeout(function(){

        menuRecycle();
        loadDashboard();

    },1200);

  })
        .restoreWarga(id);

    });

}

function hapusPermanen(id){

    Swal.fire({

        title:"Hapus Permanen?",
        text:"Data tidak dapat dikembalikan lagi.",

        icon:"warning",

        showCancelButton:true,

        confirmButtonText:"Ya, Hapus",

        cancelButtonText:"Batal",

        confirmButtonColor:"#d33"

    }).then(function(result){

        if(!result.isConfirmed) return;

        google.script.run

        .withSuccessHandler(function(){

            Swal.fire({

                icon:"success",

                title:"Berhasil",

                text:"Data berhasil dihapus permanen."

            });

            refreshRecycle();

        })

        .withFailureHandler(function(err){

            Swal.fire({

                icon:"error",

                title:"Gagal",

                text:err.message

            });

        })

        .hapusPermanenWarga(id);

    });

}

//======================================
// GLOBAL VARIABLE
//======================================

let daftarWarga = [];
let dataWarga = [];
let dataFilter = [];
let dataPembayaran = [];
let dataFilterPembayaran = [];
let keywordCari = "";
let sortColumn = 1;
let sortAsc = true;

let wargaCurrentPage = 1;
let wargaRowsPerPage = 10;

let bayarCurrentPage = 1;
let bayarRowsPerPage = 10;


function pilihWarga(){

    let cmb=document.getElementById("nama");

    document.getElementById("idWarga").value=cmb.value;

}

function loadInfoWarga(){

    //==================================================
    // AMBIL PILIHAN FORM
    //==================================================

    let id = document.getElementById("nama").value;
    let bulan = document.getElementById("bulan").value;
    let tahun = document.getElementById("tahun").value;


    //==================================================
    // VALIDASI
    //==================================================

    if(!id){
        return;
    }


    //==================================================
    // TAMPILKAN LOADING RINGAN
    //==================================================

    document.getElementById("infoWarga").innerHTML =
        "<div style='padding:15px;text-align:center'>⏳ Memuat...</div>";

    document.getElementById("statusBayar").innerHTML =
        "<div style='padding:15px;text-align:center'>⏳ Memuat...</div>";

    document.getElementById("progressPanel").innerHTML =
        "<div style='padding:15px;text-align:center'>⏳ Memuat...</div>";


    //==================================================
    // SATU PANGGILAN SERVER
    //==================================================

    google.script.run

    .withSuccessHandler(function(res){


        //================================================
        // VALIDASI HASIL
        //================================================

        if(!res){

            Swal.fire({
                icon:"error",
                title:"Data Gagal Dimuat",
                text:"Server tidak mengembalikan data."
            });

            return;

        }


        //================================================
        // 1. INFORMASI WARGA
        //================================================

        let r = res.info;

        let htmlInfo = "";

        htmlInfo += "<div class='cardTitle'>👤 Informasi Warga</div>";


        if(r){

            htmlInfo += "<div class='profileWarga'>";

            htmlInfo += "<div class='profileNama'>";
            htmlInfo += r.nama;
            htmlInfo += "</div>";

            htmlInfo += "<div class='profileStatus'>";
            htmlInfo += r.status;
            htmlInfo += "</div>";

            htmlInfo += "<hr>";

            htmlInfo += "<table class='tblInfo'>";


            // ID
            htmlInfo += "<tr>";

            htmlInfo += "<td>🆔 ID</td>";

            htmlInfo += "<td>";
            htmlInfo += r.id;
            htmlInfo += "</td>";

            htmlInfo += "</tr>";


            // ALAMAT
            htmlInfo += "<tr>";

            htmlInfo += "<td>🏠 Alamat</td>";

            htmlInfo += "<td>";
            htmlInfo += r.alamat || "-";
            htmlInfo += "</td>";

            htmlInfo += "</tr>";


            // HP
            htmlInfo += "<tr>";

            htmlInfo += "<td>📱 No. HP</td>";

            htmlInfo += "<td>";

            htmlInfo +=
                r.hp == ""
                ? "-"
                : r.hp;

            htmlInfo += "</td>";

            htmlInfo += "</tr>";


            htmlInfo += "</table>";

            htmlInfo += "</div>";

        }else{

            htmlInfo +=
                "<div style='padding:20px;text-align:center'>" +
                "Data warga tidak ditemukan." +
                "</div>";

        }


        document.getElementById("infoWarga").innerHTML =
            htmlInfo;


        //================================================
        // 2. STATUS PEMBAYARAN
        //================================================

        let s = res.statusBayar;

        let htmlStatus = "";

        htmlStatus +=
            "<div class='cardTitle'>📅 Status Bayar</div>";

        htmlStatus +=
            "<div class='statusBody'>";

        htmlStatus +=
            "<div style='font-size:18px;font-weight:700;margin-bottom:12px'>";

        htmlStatus +=
            bulan + " " + tahun;

        htmlStatus += "</div>";


        //================================================
        // SUDAH BAYAR
        //================================================

        if(s && s.status){

            htmlStatus +=
                "<div class='statusLunas'>";

            htmlStatus +=
                "✅ SUDAH LUNAS";

            htmlStatus +=
                "</div>";

            htmlStatus +=
                "<hr style='margin:18px 0'>";

            htmlStatus +=
                "<table style='width:100%'>";


            // TANGGAL
            htmlStatus += "<tr>";

            htmlStatus += "<td>Tanggal</td>";

            htmlStatus += "<td><b>";
            htmlStatus += s.tanggal;
            htmlStatus += "</b></td>";

            htmlStatus += "</tr>";


            // NOMINAL
            htmlStatus += "<tr>";

            htmlStatus += "<td>Nominal</td>";

            htmlStatus += "<td><b>";

            htmlStatus +=
                "Rp " +
                Number(
                    String(s.jumlah)
                    .replace(/\./g,"")
                )
                .toLocaleString("id-ID");

            htmlStatus += "</b></td>";

            htmlStatus += "</tr>";


            htmlStatus += "</table>";

        }


        //================================================
        // BELUM BAYAR
        //================================================

        else{

            htmlStatus +=
                "<div class='statusBelum'>";

            htmlStatus +=
                "❌ BELUM BAYAR";

            htmlStatus +=
                "</div>";

            htmlStatus +=
                "<hr style='margin:18px 0'>";

            htmlStatus +=
                "<table style='width:100%'>";

            htmlStatus += "<tr>";

            htmlStatus += "<td>Tagihan</td>";

            htmlStatus +=
                "<td><b>Rp 75.000</b></td>";

            htmlStatus += "</tr>";

            htmlStatus += "</table>";

        }


        htmlStatus += "</div>";


        document.getElementById("statusBayar").innerHTML =
            htmlStatus;


        //================================================
        // 3. PROGRESS PEMBAYARAN
        //================================================

        const bulanList = [
            "Januari","Februari","Maret","April",
            "Mei","Juni","Juli","Agustus",
            "September","Oktober","November","Desember"
        ];


        let data = res.progress || {};

        let htmlProgress = "";

        let lunas = 0;


        htmlProgress +=
            "<div class='cardTitle'>📈 Progress " +
            tahun +
            "</div>";


        htmlProgress +=
            "<div class='progress-grid'>";


        bulanList.forEach(function(b){


            if(data[b]){

                lunas++;

            }


            htmlProgress +=
                "<div class='bulan ";


            htmlProgress +=
                data[b]
                ? "lunas"
                : "belum";


            htmlProgress +=
                "' onclick=\"pilihBulan('" +
                b +
                "')\">";


            htmlProgress +=
                b.substring(0,3).toUpperCase();


            htmlProgress +=
                "</div>";

        });


        htmlProgress += "</div>";


        //================================================
        // FOOTER PROGRESS
        //================================================

        let belum = 12 - lunas;


        htmlProgress +=
            "<div class='progressFooter'>";


        htmlProgress +=
            "<span style='color:#198754'>" +
            "<b>✅ Lunas : " +
            lunas +
            " Bulan</b>" +
            "</span>";


        htmlProgress +=
            "<span style='color:#dc3545'>" +
            "<b>❌ Belum : " +
            belum +
            " Bulan</b>" +
            "</span>";


        htmlProgress += "</div>";


        document.getElementById("progressPanel").innerHTML =
            htmlProgress;

    })


    //==================================================
    // JIKA GAGAL
    //==================================================

    .withFailureHandler(function(err){

        document.getElementById("infoWarga").innerHTML =
            "<div style='padding:20px;color:red'>" +
            "❌ Gagal memuat data warga" +
            "</div>";

        document.getElementById("statusBayar").innerHTML =
            "<div style='padding:20px;color:red'>" +
            "❌ Gagal memuat status pembayaran" +
            "</div>";

        document.getElementById("progressPanel").innerHTML =
            "<div style='padding:20px;color:red'>" +
            "❌ Gagal memuat progress" +
            "</div>";


        Swal.fire({

            icon:"error",

            title:"Data Pembayaran Gagal Dimuat",

            text:err.message

        });

    })


    //==================================================
    // PANGGIL SERVER FAST
    //==================================================

    .getPanelPembayaran(
        id,
        bulan,
        tahun
    );

}


function menuPembayaran(){

    setMenuAktif("pembayaran");

    aktifkanMenu("pembayaran");

    document.getElementById("content").innerHTML =
        "<div style='padding:30px;text-align:center;font-weight:bold'>" +
        "⏳ Memuat Pembayaran..." +
        "</div>";


    //==================================================
    // AMBIL DAFTAR WARGA
    //==================================================

    google.script.run

    .withSuccessHandler(function(warga){

        daftarWarga = warga;


        //================================================
        // BENTUK HALAMAN PEMBAYARAN
        //================================================

        let html = "";

        html += "<div class='card'>";

        html += renderFormPembayaran(warga);

        html += "<hr style='margin:25px 0'>";

        html += renderRiwayat();

        html += "</div>";


        //================================================
        // TAMPILKAN HALAMAN
        //================================================

        document.getElementById("content").innerHTML = html;


        //================================================
        // LOAD DATA PEMBAYARAN
        //================================================

        loadPembayaran();


        //================================================
        // LOAD INFORMASI WARGA
        //================================================
        //
        // loadInfoWarga() sendiri nantinya akan memanggil:
        //
        // cekStatusPembayaran()
        // loadProgress()
        //
        // Jadi TIDAK perlu dipanggil lagi dari sini.
        //
        //================================================

        loadInfoWarga();

    })


    //==================================================
    // JIKA GAGAL
    //==================================================

    .withFailureHandler(function(err){

        Swal.fire({

            icon: "error",

            title: "Pembayaran Gagal Dibuka",

            text: err.message

        });

    })


    //==================================================
    // PANGGIL SERVER
    //==================================================

    .getDaftarNamaWarga();

}

function pilihBulan(bulan){

    //==================================================
    // PILIH BULAN
    //==================================================

    document.getElementById("bulan").value = bulan;


    //==================================================
    // REFRESH PANEL PEMBAYARAN
    //==================================================
    //
    // loadInfoWarga() versi FAST sekaligus memuat:
    //
    // 1. Informasi Warga
    // 2. Status Pembayaran
    // 3. Progress Pembayaran
    //
    //==================================================

    loadInfoWarga();

}

function renderFormPembayaran(warga){

    let html = "";


    //==================================================
    // LAYOUT PEMBAYARAN
    //==================================================

    html += "<div class='payment-layout'>";


    //==================================================
    // BAGIAN KIRI
    //==================================================

    html += "<div class='payment-left'>";

    html += "<div class='pageTitle'>";
    html += "💰 Pembayaran Iuran";
    html += "</div>";

    html += "<div class='formGrid'>";


    //==================================================
    // NAMA WARGA
    //==================================================

    html += "<label>Nama</label>";

    html += "<select id='nama' ";
    html += "onchange='loadInfoWarga()'>";


    warga.forEach(function(w){

        html += "<option value='" + w.id + "'>";
        html += w.nama;
        html += "</option>";

    });


    html += "</select>";


    //==================================================
    // DAFTAR BULAN
    //==================================================

    const bulan = [
        "Januari","Februari","Maret","April",
        "Mei","Juni","Juli","Agustus",
        "September","Oktober","November","Desember"
    ];


    //==================================================
    // BULAN
    //==================================================

    html += "<label>Bulan</label>";

    html += "<select id='bulan' ";
    html += "onchange='loadInfoWarga()'>";


    bulan.forEach(function(b){

        html += "<option>";
        html += b;
        html += "</option>";

    });


    html += "</select>";


    //==================================================
    // TAHUN
    //==================================================

    html += "<label>Tahun</label>";

    html += "<input ";
    html += "id='tahun' ";
    html += "value='2026' ";
    html += "readonly>";


    //==================================================
    // TANGGAL
    //==================================================

    html += "<label>Tanggal</label>";

    html += "<input ";
    html += "type='date' ";
    html += "id='tanggal'>";


    //==================================================
    // JUMLAH
    //==================================================

    html += "<label>Jumlah</label>";

    html += "<input ";
    html += "id='jumlah' ";
    html += "value='75000'>";


    //==================================================
    // KETERANGAN
    //==================================================

    html += "<label>Keterangan</label>";

    html += "<select id='keterangan'>";

    html += "<option>Lunas</option>";

    html += "<option>Pengurus</option>";

    html += "<option>Gratis</option>";

    html += "<option>Cicilan</option>";

    html += "</select>";


    html += "</div>";


    //==================================================
    // TOMBOL SIMPAN
    //==================================================

    html += "<button ";
    html += "class='btnSimpan' ";
    html += "onclick='simpanPembayaran()'>";

    html += "💾 Simpan Pembayaran";

    html += "</button>";


    html += "</div>";


    //==================================================
    // BAGIAN KANAN
    //==================================================

    html += "<div class='payment-right'>";


    //==================================================
    // STATUS PEMBAYARAN
    //==================================================

    html += "<div ";
    html += "id='statusBayar' ";
    html += "class='status-card'>";

    html += "Loading...";

    html += "</div>";


    //==================================================
    // INFORMASI WARGA
    //==================================================

    html += "<div class='payment-info'>";

    html += "<div id='infoWarga'>";

    html += "Loading...";

    html += "</div>";

    html += "</div>";


    //==================================================
    // PROGRESS PEMBAYARAN
    //==================================================

    html += "<div ";
    html += "id='progressPanel' ";
    html += "class='progress-card'>";

    html += "Loading...";

    html += "</div>";


    html += "</div>";


    //==================================================
    // TUTUP LAYOUT
    //==================================================

    html += "</div>";


    return html;

}

function menuTools(){

    setMenuAktif("tools");

    aktifkanMenu("tools");

    let html = "";

    html += "<div class='card toolsPage'>";

    html += "<h2>🧰 Tools</h2>";
    html += "<p class='toolsSubtitle'>Pengaturan dan administrasi SIWARGA</p>";

    html += "<div class='toolsGrid'>";

    // SETTING
    html += "<div class='toolCard' onclick='menuSetting()'>";
    html += "<div class='toolIcon'>⚙️</div>";
    html += "<div class='toolTitle'>Setting</div>";
    html += "<div class='toolDesc'>Pengaturan aplikasi</div>";
    html += "</div>";

    // RESET PASSWORD
    html += "<div class='toolCard' onclick='menuResetPassword()'>";
    html += "<div class='toolIcon'>🔑</div>";
    html += "<div class='toolTitle'>Reset Password</div>";
    html += "<div class='toolDesc'>Kelola password warga</div>";
    html += "</div>";

    // RECYCLE BIN
    html += "<div class='toolCard' onclick='menuRecycle()'>";
    html += "<div class='toolIcon'>📂</div>";
    html += "<div class='toolTitle'>Recycle Bin</div>";
    html += "<div class='toolDesc'>Data yang telah dihapus</div>";
    html += "</div>";

    // AUDIT TRAIL
    html += "<div class='toolCard' onclick='menuAuditTrail()'>";
    html += "<div class='toolIcon'>📋</div>";
    html += "<div class='toolTitle'>Audit Trail</div>";
    html += "<div class='toolDesc'>Riwayat aktivitas sistem</div>";
    html += "</div>";

    html += "</div>";

    html += "</div>";

    document.getElementById("content").innerHTML = html;

}

function menuAuditTrail(){

    aktifkanMenu("tools");

    document.getElementById("content").innerHTML = `
    
    <div class="card">

        <h2>📋 Audit Trail</h2>

        <p>Riwayat aktivitas SIWARGA</p>

        <br>

        <div style="margin-bottom:20px;">

            <input
                type="text"
                id="cariAudit"
                placeholder="Cari User / Modul / Aksi / ID / Nama"
                oninput="filterAuditTrail()"
                style="
                    width:350px;
                    max-width:100%;
                    padding:12px;
                    box-sizing:border-box;
                "
            >

        </div>

        <div id="listAudit">
            Memuat data...
        </div>

    </div>

    `;

    google.script.run

    .withSuccessHandler(function(data){

        dataAuditTrail = data;
        dataFilterAudit = [...data];
        auditPage = 1;

        renderAuditTrail();

    })

    .withFailureHandler(function(err){

        Swal.fire({
            icon:"error",
            title:"Audit Trail Gagal",
            text:err.message
        });

    })

    .getAuditTrail();

}

function renderAuditTrail(){

    const data = dataFilterAudit;

    let totalPage = Math.max(
        1,
        Math.ceil(data.length / auditPerPage)
    );

    if(auditPage > totalPage){
        auditPage = totalPage;
    }

    if(auditPage < 1){
        auditPage = 1;
    }

    if(!data || data.length === 0){

        document.getElementById("listAudit").innerHTML =
            "<p>Belum ada data Audit Trail.</p>";

        return;
    }

    let mulai = (auditPage - 1) * auditPerPage;
    let akhir = Math.min(
        mulai + auditPerPage,
        data.length
    );

    let html = "";

    html += "<div style='overflow-x:auto;'>";

    html += "<table class='tbl'>";

    html += "<thead><tr>";

    html += "<th>No</th>";
    html += "<th>Tanggal / Waktu</th>";
    html += "<th>User</th>";
    html += "<th>Modul</th>";
    html += "<th>Aksi</th>";
    html += "<th>ID</th>";
    html += "<th>Nama</th>";
    html += "<th>Detail / Data Lama</th>";
    html += "<th>Data Baru</th>";

    html += "</tr></thead>";

    html += "<tbody>";

    for(let i = mulai; i < akhir; i++){

        const r = data[i];

        html += "<tr>";

        html += "<td align='center'>" + (i + 1) + "</td>";
        html += "<td>" + (r[1] || "") + "</td>";
        html += "<td>" + (r[2] || "") + "</td>";
        html += "<td>" + (r[3] || "") + "</td>";
        html += "<td>" + (r[4] || "") + "</td>";
        html += "<td>" + (r[5] || "") + "</td>";
        html += "<td>" + (r[6] || "") + "</td>";
        html += "<td>" + (r[7] || "") + "</td>";
        html += "<td>" + (r[8] || "") + "</td>";

        html += "</tr>";
    }

    html += "</tbody></table>";
    html += "</div>";

    //==========================
    // PAGINATION
    //==========================

    html += "<div class='pagination'>";

    html += "<button onclick='auditPrev()'";
    if(auditPage === 1) html += " disabled";
    html += ">‹</button>";

    html += "<span>";
    html += "Halaman " + auditPage + " dari " + totalPage;
    html += "</span>";

    html += "<button onclick='auditNext()'";
    if(auditPage === totalPage) html += " disabled";
    html += ">›</button>";

    html += "</div>";

    document.getElementById("listAudit").innerHTML = html;

}

function auditPrev(){

    if(auditPage > 1){

        auditPage--;

        renderAuditTrail();

    }

}


function auditNext(){

    const totalPage =
        Math.ceil(dataFilterAudit.length / auditPerPage);

    if(auditPage < totalPage){

        auditPage++;

        renderAuditTrail();

    }

}

function filterAuditTrail(){

    const keyword =
        document.getElementById("cariAudit")
        .value
        .toLowerCase()
        .trim();

    if(keyword === ""){

        dataFilterAudit = [...dataAuditTrail];
        auditPage = 1;

        renderAuditTrail();
        return;

    }

    const hasil = dataAuditTrail.filter(function(r){

        return (
            String(r[2] || "").toLowerCase().includes(keyword) ||
            String(r[3] || "").toLowerCase().includes(keyword) ||
            String(r[4] || "").toLowerCase().includes(keyword) ||
            String(r[5] || "").toLowerCase().includes(keyword) ||
            String(r[6] || "").toLowerCase().includes(keyword) ||
            String(r[7] || "").toLowerCase().includes(keyword) ||
            String(r[8] || "").toLowerCase().includes(keyword)
        );

    });

    dataFilterAudit = hasil;
    auditPage = 1;

    renderAuditTrail();

}

function renderRiwayat(){

    let html="";

    html+="<div class='card'>";

    //==========================
    // FILTER
    //==========================

    html+="<div class='toolbar'>";


    html+="<div class='left-toolbar'>";

    // Tombol Hapus Massal (disembunyikan dulu)
    html+="<button ";

    html+="id='btnHapusPembayaran' ";

    html+="class='btnNonaktifkan' ";

    html+="style='display:none' ";

    html+="onclick='hapusMassalPembayaran()'>";

    html+="🗑 Hapus (0)";

    html+="</button>";

    html+="<input ";

    html+="id='cariBayar' ";
  


    html+="class='search' ";

    html+="placeholder='Cari Nama / ID ' ";

    html+="onkeyup='filterPembayaran()'>";

    html+="&nbsp;&nbsp;";

    html+="<select id='filterBulan' onchange='filterPembayaran()'>";

    html+="<option value=''>Semua Bulan</option>";

    html+="<option>Januari</option>";
    html+="<option>Februari</option>";
    html+="<option>Maret</option>";
    html+="<option>April</option>";
    html+="<option>Mei</option>";
    html+="<option>Juni</option>";
    html+="<option>Juli</option>";
    html+="<option>Agustus</option>";
    html+="<option>September</option>";
    html+="<option>Oktober</option>";
    html+="<option>November</option>";
    html+="<option>Desember</option>";

    html+="</select>";

    html+="&nbsp;&nbsp;";

    html+="<select id='filterTahun' onchange='filterPembayaran()'>";

    html+="<option value=''>Semua Tahun</option>";

    html+="<option>2024</option>";

    html+="<option>2025</option>";

    html+="<option selected>2026</option>";

    html+="</select>";

    html+="</div>";

    html+="</div>";

    //==========================
    // RINGKASAN
    //==========================

    html+="<div id='summaryPembayaran' style='margin:15px 0'></div>";

    //==========================
    // TABEL
    //==========================

    html+="<div id='listPembayaran'></div>";

    html+="</div>";

    return html;

}

function loadPembayaran(){

    google.script.run

    .withSuccessHandler(function(data){

        dataPembayaran = data;
        dataFilterPembayaran = [...data];

        pembayaranPage = 1;

        renderPembayaran();

        updateSummaryPembayaran();

    })

    .withFailureHandler(function(err){

        Swal.fire({
            icon:"error",
            title:"Load Pembayaran Gagal",
            text:err.message
        });

    })

    .getPembayaran();

}

function refreshWarga(){

    google.script.run

    .withSuccessHandler(function(data){

        dataWarga = data;
        dataFilter = [...data];

        // Pertahankan halaman yang sedang dibuka
        let totalHalaman = Math.max(
            1,
            Math.ceil(dataFilter.length / wargaRowsPerPage)
        );

        if(wargaCurrentPage > totalHalaman){
            wargaCurrentPage = totalHalaman;
        }

        document.getElementById("tblWarga").innerHTML =
            renderTabelWarga(dataFilter);

    })

    .getWarga();

}

//==================================================
// REFRESH HALAMAN
//==================================================

function refreshSemua(menu){

    switch(menu){

        case "WARGA":

            menuWarga();

            break;

        case "PEMBAYARAN":

            menuPembayaran();

            break;

        case "RECYCLE":

            menuRecycle();

            break;

        default:

            menuDashboard();

            break;

    }

}

//==================================================
// RENDER TABEL PEMBAYARAN
//==================================================

function renderPembayaran(){

    let data = dataFilterPembayaran;


    //==================================================
    // CEK JUMLAH HALAMAN
    //==================================================

    let totalPage = Math.max(
        1,
        Math.ceil(data.length / pembayaranPerPage)
    );


    if(pembayaranPage > totalPage){

        pembayaranPage = totalPage;

    }


    if(pembayaranPage < 1){

        pembayaranPage = 1;

    }


    let html = "";


    //==================================================
    // PEMBUNGKUS TABEL
    // AGAR BISA DIGESER KIRI / KANAN DI HP
    //==================================================

    html += "<div class='table-responsive'>";


    //==================================================
    // TABEL
    //==================================================

    html += "<table class='tbl'>";

    html += "<thead>";

    html += "<tr>";


    //==================================================
    // CHECKBOX SEMUA
    //==================================================

    html += "<th width='40'>";

    html +=
        "<input " +
        "type='checkbox' " +
        "id='cekSemuaPembayaran' " +
        "onclick='cekSemuaPembayaran()'>";

    html += "</th>";


    //==================================================
    // HEADER
    //==================================================

    html += "<th>No</th>";

    html += "<th>ID</th>";

    html += "<th>Nama</th>";

    html += "<th>Tanggal</th>";

    html += "<th>Bulan</th>";

    html += "<th>Tahun</th>";

    html += "<th>Jumlah</th>";

    html += "<th>Status</th>";

    html += "<th width='90'>Aksi</th>";


    html += "</tr>";

    html += "</thead>";

    html += "<tbody>";


    //==================================================
    // PAGINATION
    //==================================================

    let mulai =
        (pembayaranPage - 1) *
        pembayaranPerPage;


    let akhir =
        Math.min(
            mulai + pembayaranPerPage,
            data.length
        );


    //==================================================
    // ISI DATA
    //==================================================

    for(let i = mulai; i < akhir; i++){


        html += "<tr>";


        //================================================
        // CHECKBOX
        //================================================

        html += "<td align='center'>";

        html +=
            "<input " +
            "type='checkbox' " +
            "class='cekPembayaran' " +
            "value='" + data[i][0] + "' " +
            "onchange='hitungChecklistPembayaran()'>";

        html += "</td>";


        //================================================
        // NOMOR
        //================================================

        html +=
            "<td align='center'>" +
            (i + 1) +
            "</td>";


        //================================================
        // ID
        //================================================

        html +=
            "<td>" +
            data[i][1] +
            "</td>";


        //================================================
        // NAMA
        //================================================

        html +=
            "<td>" +
            data[i][2] +
            "</td>";


        //================================================
        // TANGGAL
        //================================================

        html +=
            "<td>" +
            data[i][3] +
            "</td>";


        //================================================
        // BULAN
        //================================================

        html +=
            "<td>" +
            data[i][4] +
            "</td>";


        //================================================
        // TAHUN
        //================================================

        html +=
            "<td>" +
            data[i][5] +
            "</td>";


        //================================================
        // NOMINAL
        //================================================

        let nominal =
            Number(
                String(data[i][6])
                .replace(/\./g,"")
            );


        if(nominal < 1000){

            nominal *= 1000;

        }


        html +=
            "<td align='right'>" +

            "<b>Rp " +

            nominal.toLocaleString("id-ID") +

            "</b>" +

            "</td>";


        //================================================
        // STATUS
        //================================================

        html +=
            "<td>" +
            data[i][7] +
            "</td>";


        //================================================
        // AKSI
        //================================================

        html += "<td align='center'>";


        // EDIT

        html +=
            "<button " +

            "class='btnEdit' " +

            "onclick=\"editPembayaran('" +
            data[i][0] +
            "')\">" +

            "✏️" +

            "</button>";


        // HAPUS

        html +=
            "<button " +

            "class='btnHapus' " +

            "onclick=\"hapusPembayaran('" +
            data[i][0] +
            "')\">" +

            "🗑️" +

            "</button>";


        html += "</td>";


        html += "</tr>";

    }


    //==================================================
    // TUTUP TABEL
    //==================================================

    html += "</tbody>";

    html += "</table>";


    //==================================================
    // TUTUP PEMBUNGKUS SCROLL
    //==================================================

    html += "</div>";


    //==================================================
    // PAGINATION
    // DILETAKKAN DI LUAR AREA SCROLL
    //==================================================

    html +=
        "<div id='pagingPembayaran'></div>";


    //==================================================
    // TAMPILKAN
    //==================================================

    document
        .getElementById("listPembayaran")
        .innerHTML = html;


    //==================================================
    // RENDER PAGINATION
    //==================================================

    renderPagingPembayaran();

}

function editPembayaran(no){

    aktifkanMenu("pembayaran");

    google.script.run

    .withSuccessHandler(function(r){

        let html="";

        html+="<div class='card'>";

        html+="<h2>✏ Edit Pembayaran</h2>";

        html+="<input type='hidden' id='row' value='"+r.row+"'>";
        html+="<input type='hidden' id='no' value='"+r.no+"'>";
        html+="<input type='hidden' id='id' value='"+r.id+"'>";

        html+="<div class='formGrid'>";

        html+="<label>Nama</label>";
        html+="<input id='nama' value='"+r.nama+"' readonly>";

        html+="<label>Tanggal</label>";
       html+="<input id='tanggal' value='"+r.tanggal+"'>";

        html+="<label>Bulan</label>";

        html+="<select id='bulan'>";

        const bulanList=[
            "Januari","Februari","Maret","April",
            "Mei","Juni","Juli","Agustus",
            "September","Oktober","November","Desember"
        ];

        bulanList.forEach(function(b){

            html+="<option "+(b==r.bulan?"selected":"")+">"+b+"</option>";

        });

        html+="</select>";

        html+="<label>Tahun</label>";

        html+="<input id='tahun' value='"+r.tahun+"'>";

        html+="<label>Jumlah</label>";

        html+="<input id='jumlah' value='"+r.jumlah+"'>";

        html+="<label>Keterangan</label>";

        html+="<select id='keterangan'>";

        ["Lunas","Pengurus","Gratis","Cicilan"].forEach(function(s){

            html+="<option "+(s==r.status?"selected":"")+">"+s+"</option>";

        });

        html+="</select>";

        html+="</div>";

        html+="<br>";

        html+="<button class='btnTambah' onclick='updatePembayaran()'>";

        html+="💾 Update";

        html+="</button>";

        html+="&nbsp;";

        html+="<button class='btnBatal' onclick='menuPembayaran()'>";

        html+="Batal";

        html+="</button>";

        html+="</div>";

        document.getElementById("content").innerHTML=html;

    })

    .withFailureHandler(function(err){

        Swal.fire({
            icon:"error",
            title:"Edit Pembayaran Gagal",
            text:err.message
        });

    })

    .getPembayaranByNo(no);

}

function updatePembayaran(){

    let row        = document.getElementById("row").value;
    let no         = document.getElementById("no").value;
    let id         = document.getElementById("id").value;
    let nama       = document.getElementById("nama").value;
    let tanggal    = document.getElementById("tanggal").value;
    let bulan      = document.getElementById("bulan").value;
    let tahun      = document.getElementById("tahun").value;
    let jumlah     = document.getElementById("jumlah").value;
    let keterangan = document.getElementById("keterangan").value;

    //==========================
    // VALIDASI
    //==========================

    if(tanggal==""){

        Swal.fire({
            icon:"warning",
            title:"Tanggal belum diisi"
        });

        return;

    }

    if(jumlah==""){

        Swal.fire({
            icon:"warning",
            title:"Nominal belum diisi"
        });

        return;

    }

    //==========================
    // UPDATE
    //==========================

    google.script.run

    .withSuccessHandler(function(){

        Swal.fire({

            icon:"success",

            title:"Berhasil",

            text:"Pembayaran berhasil diperbarui.",

            timer:1500,

            showConfirmButton:false

        });

        setTimeout(function(){

            menuPembayaran();

        },1500);

    })

    .withFailureHandler(function(err){

        Swal.fire({

            icon:"error",

            title:"Gagal",

            text:err.message

        });

    })

    .updatePembayaran(

        row,
        no,
        id,
        nama,
        tanggal,
        bulan,
        tahun,
        jumlah,
        keterangan

    );

}

function refreshPembayaran(){

    loadPembayaran();

    loadInfoWarga();

    cekStatusPembayaran();

    loadProgress();

}


function renderPagingPembayaran(){

    let totalPage = Math.max(
        1,
        Math.ceil(
            dataFilterPembayaran.length /
            pembayaranPerPage
        )
    );

    let html="<div style='margin-top:15px;text-align:center'>";

    html+="<button ";

    if(pembayaranPage==1){

        html+="disabled";

    }

    html+=" onclick='pagePembayaran("+(pembayaranPage-1)+")'>◀ Sebelumnya</button>";

    html+="&nbsp;&nbsp;";

    html+="Halaman ";

    html+=pembayaranPage;

    html+=" / ";

    html+=totalPage;

    html+="&nbsp;&nbsp;";

    html+="<button ";

    if(pembayaranPage>=totalPage){

        html+="disabled";

    }

    html+=" onclick='pagePembayaran("+(pembayaranPage+1)+")'>Berikutnya ▶</button>";

    html+="</div>";

    document.getElementById("pagingPembayaran").innerHTML=html;

}

function pagePembayaran(page){

    let totalPage = Math.max(
        1,
        Math.ceil(
            dataFilterPembayaran.length /
            pembayaranPerPage
        )
    );

    if(page < 1){
        page = 1;
    }

    if(page > totalPage){
        page = totalPage;
    }

    pembayaranPage = page;

    renderPembayaran();

}

function cekSemuaPembayaran(){

    const cek = document.getElementById("cekSemuaPembayaran").checked;

    document.querySelectorAll(".cekPembayaran").forEach(function(c){

        c.checked = cek;

    });

    hitungChecklistPembayaran();

}

function hitungChecklistPembayaran(){

    pembayaranDipilih=[];

    document.querySelectorAll(".cekPembayaran").forEach(function(c){

        if(c.checked){

            pembayaranDipilih.push(c.value);

        }

    });

    let btn = document.getElementById("btnHapusPembayaran");

    if(!btn) return;

    if(pembayaranDipilih.length==0){

        btn.style.display="none";

    }else{

        btn.style.display="inline-flex";

        btn.innerHTML="🗑 Hapus ("+pembayaranDipilih.length+")";

    }

}

function cekStatusPembayaran(){

    let id = document.getElementById("nama").value;
    let bulan = document.getElementById("bulan").value;
    let tahun = document.getElementById("tahun").value;

    google.script.run
    .withSuccessHandler(function(r){

        let html="";

        html+="<div class='cardTitle'>📅 Status Bayar</div>";
        html+="<div class='statusBody'>";

        html+="<div style='font-size:18px;font-weight:700;margin-bottom:12px'>";
        html+=bulan+" "+tahun;
        html+="</div>";

        if(r.status){

            html+="<div class='statusLunas'>";
            html+="✅ SUDAH LUNAS";
            html+="</div>";

            html+="<hr style='margin:18px 0'>";

            html+="<table style='width:100%'>";

            html+="<tr>";
            html+="<td>Tanggal</td>";
            html+="<td><b>"+r.tanggal+"</b></td>";
            html+="</tr>";

            html+="<tr>";
            html+="<td>Nominal</td>";
            html+="<td><b>Rp "+Number(r.jumlah).toLocaleString("id-ID")+"</b></td>";
            html+="</tr>";

            html+="</table>";

        }else{

            html+="<div class='statusBelum'>";
            html+="❌ BELUM BAYAR";
            html+="</div>";

            html+="<hr style='margin:18px 0'>";

            html+="<table style='width:100%'>";

            html+="<tr>";
            html+="<td>Tagihan</td>";
            html+="<td><b>Rp 75.000</b></td>";
            html+="</tr>";

            html+="</table>";

        }

        html+="</div>";

        document.getElementById("statusBayar").innerHTML = html;

    })

    .cekPembayaran(id,bulan,tahun);

}

function filterPembayaran(){

    let cari = document.getElementById("cariBayar").value.toLowerCase().trim();

    let bulan = document.getElementById("filterBulan").value;

    let tahun = document.getElementById("filterTahun").value;

    dataFilterPembayaran = dataPembayaran.filter(function(r){

        let cocokCari =
            String(r[1]).toLowerCase().includes(cari) ||
            String(r[2]).toLowerCase().includes(cari);

        let cocokBulan =
            (bulan=="") || (r[4]==bulan);

        let cocokTahun =
            (tahun=="") || (String(r[5])==String(tahun));

        return cocokCari && cocokBulan && cocokTahun;

    });

    //==========================
    // RESET KE HALAMAN PERTAMA
    //==========================

    pembayaranPage = 1;

    renderPembayaran();

    updateSummaryPembayaran();

}

function updateSummaryPembayaran(){

    let totalTransaksi = dataFilterPembayaran.length;

    let totalNominal = 0;

    dataFilterPembayaran.forEach(function(r){

        let nominal = Number(String(r[6]).replace(/\./g,""));

        if(nominal < 1000){

            nominal *= 1000;

        }

        totalNominal += nominal;

    });

    let html="";

    html+="<div class='summaryBox'>";

    html+="<b>Total Transaksi :</b> ";

    html+=totalTransaksi;

    html+="&nbsp;&nbsp;&nbsp;";

    html+="<b>Total Penerimaan :</b> ";

    html+="Rp ";

    html+=totalNominal.toLocaleString("id-ID");

    html+="</div>";

    document.getElementById("summaryPembayaran").innerHTML = html;

}

function simpanPembayaran(){

    let id       = document.getElementById("nama").value;
    let nama     = document.getElementById("nama").options[
                      document.getElementById("nama").selectedIndex
                   ].text;

    let tanggal  = document.getElementById("tanggal").value;
    let bulan    = document.getElementById("bulan").value;
    let tahun    = document.getElementById("tahun").value;
    let jumlah   = document.getElementById("jumlah").value;
    let ket      = document.getElementById("keterangan").value;

    google.script.run

    .withSuccessHandler(function(ada){

        if(ada){

            Swal.fire({
                icon:'warning',
                title:'Pembayaran Sudah Ada',
                html:
                    "<b>"+nama+"</b><br>" +
                    "sudah membayar<br>" +
                    "<b>"+bulan+" "+tahun+"</b>"
            });

            return;

        }

        google.script.run

        .withSuccessHandler(function(){

            Swal.fire({
                icon:'success',
                title:'Berhasil',
                text:'Pembayaran berhasil disimpan.',
                timer:1200,
                showConfirmButton:false
            });

            refreshSemua("PEMBAYARAN");

            document.getElementById("tanggal").value="";

        })

        .simpanPembayaran(
            id,
            nama,
            tanggal,
            bulan,
            tahun,
            jumlah,
            ket
        );

    })

    .adaPembayaran(
        id,
        bulan,
        tahun
    );

}

function hapusPembayaran(baris){

    Swal.fire({

      title:'Hapus Pembayaran?',

      text:'Data pembayaran akan dihapus.',

      icon:'warning',

      showCancelButton:true,

      confirmButtonText:'Ya',

      cancelButtonText:'Batal',

      confirmButtonColor:'#d33'

    }).then((r)=>{

    if(!r.isConfirmed) return;

      google.script.run

      .withSuccessHandler(function(){

          Swal.fire({

            icon:'success',

            title:'Berhasil',

            text:'Pembayaran dihapus',

            timer:1500,

            showConfirmButton:false

          });

          setTimeout(function(){

          refreshSemua("PEMBAYARAN");

          },1500);

      })

      .hapusPembayaran(baris);

    });

}

function hapusMassalPembayaran(){

    if(pembayaranDipilih.length==0){

        Swal.fire({

            icon:"warning",

            title:"Belum ada pembayaran yang dipilih"

        });

        return;

    }

    Swal.fire({

        title:"Hapus Pembayaran?",

        text:"Jumlah data : "+pembayaranDipilih.length,

        icon:"warning",

        showCancelButton:true,

        confirmButtonText:"Ya",

        cancelButtonText:"Batal"

    }).then((r)=>{

        if(!r.isConfirmed) return;

        google.script.run

        .withSuccessHandler(function(jml){

            Swal.fire({

                icon:"success",

                title:"Berhasil",

                text:jml+" pembayaran berhasil dihapus",

                timer:1200,

                showConfirmButton:false

            });

            pembayaranDipilih=[];

            loadPembayaran();

            loadDashboard();

        })

        .hapusMassalPembayaran(pembayaranDipilih);

    });

}

function loadProgress(){

    let id = document.getElementById("nama").value;
    let tahun = document.getElementById("tahun").value;

    google.script.run

    .withSuccessHandler(function(data){

        const bulanList = [
            "Januari","Februari","Maret","April",
            "Mei","Juni","Juli","Agustus",
            "September","Oktober","November","Desember"
        ];

        let html = "";

        let lunas = 0;

        html += "<div class='cardTitle'>📈 Progress " + tahun + "</div>";

        html += "<div class='progress-grid'>";

        bulanList.forEach(function(b){

            if(data[b]){
                lunas++;
            }

            html += "<div class='bulan ";

            html += data[b] ? "lunas" : "belum";

            html += "' onclick=\"pilihBulan('" + b + "')\">";

            html += b.substring(0,3).toUpperCase();

            html += "</div>";

        });

        html += "</div>";

        let belum = 12 - lunas;

        html += "<div class='progressFooter'>";

        html += "<span style='color:#198754'><b>✅ Lunas : "
              + lunas +
              " Bulan</b></span>";

        html += "<span style='color:#dc3545'><b>❌ Belum : "
              + belum +
              " Bulan</b></span>";

        html += "</div>";

        document.getElementById("progressPanel").innerHTML = html;

    })

    .withFailureHandler(function(err){

        document.getElementById("progressPanel").innerHTML =
        "<div style='padding:20px;color:red;font-weight:bold'>" +
        "❌ Gagal memuat progress<br><br>" +
        err.message +
        "</div>";

    })

    .getProgressPembayaran(id, tahun);

}

function menuRecycle(){

    aktifkanMenu("recycle");

    document.getElementById("content").innerHTML="Loading...";

    let html="";

    html+="<div class='card'>";

    html+="<h3>🗑️ Recycle Bin Warga</h3>";

    html+="<br>";

    html+="<div id='tblRecycle'>Loading...</div>";

    html+="</div>";

    document.getElementById("content").innerHTML=html;

    refreshRecycle();

}

function refreshRecycle(){

    google.script.run

    .withSuccessHandler(function(data){

        let html="";

        if(data.length==0){

            html="<p>Tidak ada data.</p>";

        }else{

            //==================================
            // TOOLBAR
            //==================================

            html+="<div class='recycleToolbar'>";

            html+="<button class='btnRestoreAll' onclick='restoreTerpilih()'>";

            html+="♻ Restore Terpilih";

            html+="</button>";

            html+="&nbsp;";

            html+="<button class='btnDeleteAll' onclick='hapusTerpilih()'>";

            html+="🗑 Hapus Terpilih";

            html+="</button>";

            html+="&nbsp;";

            html+="<button class='btnDeleteAll' onclick='kosongkanRecycle()'>";

            html+="🧹 Kosongkan Recycle Bin";

            html+="</button>";

            html+="</div>";

            //==================================
            // TABEL
            //==================================

            html+="<table class='tbl'>";

            html+="<thead>";

            html+="<tr>";

            html+="<th width='45'>";

            html+="<input ";

            html+="type='checkbox' ";

            html+="id='cekSemuaRecycle' ";

            html+="onclick='cekSemuaRecycle()'>";

            html+="</th>";

            html+="<th width='60'>No</th>";

            html+="<th width='100'>ID</th>";

            html+="<th>Nama</th>";

            html+="<th>Alamat</th>";

            html+="<th width='120'>Status</th>";

            html+="</tr>";

            html+="</thead>";

            html+="<tbody>";

            data.forEach(function(r,i){

                html+="<tr>";

                html+="<td align='center'>";

                html+="<input ";

                html+="type='checkbox' ";

                html+="class='cekRecycle' ";

                html+="value='"+r[0]+"'>";

                html+="</td>";

                html+="<td>"+(i+1)+"</td>";

                html+="<td>"+r[0]+"</td>";

                html+="<td>"+r[1]+"</td>";

                html+="<td>"+r[2]+"</td>";

                html+="<td>"+r[4]+"</td>";

                html+="</tr>";

            });

            html+="</tbody>";

            html+="</table>";

        }

        document.getElementById("tblRecycle").innerHTML=html;

    })

    .getRecycleWarga();

}

function cekSemuaRecycle(){

    let cek = document.getElementById("cekSemuaRecycle").checked;

    document.querySelectorAll(".cekRecycle").forEach(function(c){

        c.checked = cek;

    });

}

function restoreTerpilih(){

    let idList=[];

    document.querySelectorAll(".cekRecycle").forEach(function(c){

        if(c.checked){

            idList.push(c.value);

        }

    });

    if(idList.length==0){

        Swal.fire(
            "Perhatian",
            "Pilih minimal satu data.",
            "warning"
        );

        return;

    }

    Swal.fire({

        icon:"question",

        title:"Restore Data",

        text:"Restore "+idList.length+" warga?",

        showCancelButton:true

    }).then(function(r){

        if(!r.isConfirmed) return;

        google.script.run

        .withSuccessHandler(function(jumlah){

            Swal.fire(

                "Berhasil",

                jumlah+" warga berhasil direstore.",

                "success"

            );

            refreshRecycle();

        })

        .restoreMassalWarga(idList);

    });

}

function hapusTerpilih(){

    let idList=[];

    document.querySelectorAll(".cekRecycle").forEach(function(c){

        if(c.checked){

            idList.push(c.value);

        }

    });

    if(idList.length==0){

        Swal.fire(
            "Perhatian",
            "Pilih minimal satu data.",
            "warning"
        );

        return;

    }

    Swal.fire({

        icon:"warning",

        title:"Hapus Permanen",

        html:"<b>"+idList.length+"</b> data akan dihapus permanen.",

        showCancelButton:true,

        confirmButtonColor:"#d33"

    }).then(function(r){

        if(!r.isConfirmed) return;

        google.script.run

        .withSuccessHandler(function(jumlah){

            Swal.fire(

                "Berhasil",

                jumlah+" data dihapus.",

                "success"

            );

            refreshRecycle();

        })

        .hapusMassalPermanen(idList);

    });

}

function kosongkanRecycle(){

    Swal.fire({

        icon:"warning",

        title:"Kosongkan Recycle Bin?",

        text:"Semua data nonaktif akan dihapus permanen.",

        showCancelButton:true,

        confirmButtonColor:"#d33"

    }).then(function(r){

        if(!r.isConfirmed) return;

        google.script.run

        .withSuccessHandler(function(jumlah){

            Swal.fire(

                "Berhasil",

                jumlah+" data dihapus.",

                "success"

            );

            refreshRecycle();

        })

        .kosongkanRecycleBin();

    });

}

function aktifkanMenu(menu){

    document.querySelectorAll(".menu button")
    .forEach(function(btn){

        btn.classList.remove("active");

    });

    switch(menu){

        case "dashboard":

            document
            .getElementById("btnDashboard")
            .classList.add("active");

            break;

        case "warga":

            document
            .getElementById("btnWarga")
            .classList.add("active");

            break;

        case "pembayaran":

            document
            .getElementById("btnPembayaran")
            .classList.add("active");

            break;

        case "tools":

            document
            .getElementById("btnTools")
            .classList.add("active");

            break;

    }

}

function formatNoHP(){

    let hp = document.getElementById("nohp").value.trim();

    hp = hp.replace(/\s/g,"");
    hp = hp.replace(/-/g,"");

    if(hp.startsWith("+62")){

        hp = "0" + hp.substring(3);

    }else if(hp.startsWith("62")){

        hp = "0" + hp.substring(2);

    }else if(!hp.startsWith("0") && hp!=""){

        hp = "0" + hp;

    }

    document.getElementById("nohp").value = hp;

}

/*==================================================
LOGIN 
==================================================*/

function pilihLogin(jenis){

    if(jenis=="warga"){

        tampilForm("formWarga");

    }else{

        tampilForm("formLogin");

    }

}

//-------------------------------------------------
// MENAMPILKAN SATU FORM LOGIN
//-------------------------------------------------

function tampilForm(namaForm){

    // Sembunyikan semua form
    document.getElementById("halamanAwal").style.display = "none";
    document.getElementById("formWarga").style.display = "none";
    document.getElementById("formAktivasi").style.display = "none";
    document.getElementById("formPassword").style.display = "none";
    document.getElementById("formLogin").style.display = "none";

    // Tampilkan form yang dipilih
    document.getElementById(namaForm).style.display = "block";

}

function kembaliAwal(){

    HP_LOGIN="";

    document.getElementById("halamanAwal").style.display="block";

    document.getElementById("formWarga").style.display="none";

    document.getElementById("formAktivasi").style.display="none";

    document.getElementById("formPassword").style.display="none";

    document.getElementById("formLogin").style.display="none";

    // kosongkan textbox
    document.getElementById("hpLogin").value="";

    document.getElementById("pass1").value="";

    document.getElementById("pass2").value="";

    document.getElementById("passwordWarga").value="";

    document.getElementById("username").value="";

    document.getElementById("password").value="";

}

//==================================================
// CEK LOGIN WARGA DENGAN NOMOR HP
//==================================================

function cekLoginWarga(){

    const inputHP =
        document.getElementById("hpLogin");

    let hp =
        inputHP.value.trim();


    //================================================
    // VALIDASI NOMOR HP
    //================================================

    if(hp==""){

        Swal.fire({
            icon:"warning",
            title:"Nomor HP Kosong",
            text:"Silakan masukkan nomor HP."
        });

        return;
    }


    //================================================
    // CEK KE SERVER
    //================================================

    google.script.run

    .withSuccessHandler(function(res){

        console.log("CEK HP =",res);


        if(!res){

            Swal.fire({
                icon:"error",
                title:"Gagal",
                text:"Server tidak mengembalikan data."
            });

            return;
        }


        //================================================
        // 1. NOMOR HP SUDAH TERDAFTAR
        //================================================

        if(res.status == "LOGIN"){

            HP_LOGIN = hp;

            document.getElementById("formWarga")
                .style.display="none";

            document.getElementById("formPassword")
                .style.display="block";

            document.getElementById("passwordWarga")
                .value="";

            document.getElementById("passwordWarga")
                .focus();

            return;
        }


        //================================================
        // 2. AKUN ADA TAPI PASSWORD BELUM DIBUAT
        //================================================

        if(res.status == "AKTIVASI"){

            HP_LOGIN = hp;

            Swal.fire({

                icon:"info",

                title:"Aktivasi Akun",

                html:
                    "Anda terdaftar atas nama:<br><br>" +
                    "<b>"+(res.nama || "")+"</b><br><br>" +
                    "Silakan membuat password terlebih dahulu.",

                confirmButtonText:"LANJUT"

            }).then(function(){

                document.getElementById("formWarga")
                    .style.display="none";

                document.getElementById("formAktivasi")
                    .style.display="block";

            });

            return;
        }

        //================================================
        // WARGA SUDAH ADA DI SHEET WARGA
        // TETAPI BELUM PUNYA AKUN USER
        //================================================

        if(res.status == "WARGA_DITEMUKAN"){

            HP_LOGIN = hp;

            //==========================================
            // NOMOR HP SUDAH COCOK DENGAN DATA WARGA
            // LANGSUNG BUAT AKUN USER
            //==========================================

            google.script.run

            .withSuccessHandler(function(resAktivasi){

                if(!resAktivasi.status){

                    Swal.fire({
                        icon:"error",
                        title:"Aktivasi Gagal",
                        text:
                            resAktivasi.pesan ||
                            "Aktivasi akun gagal."
                    });

                    return;
                }


                //======================================
                // AKUN BERHASIL DIBUAT
                //======================================

                Swal.fire({

                    icon:"success",

                    title:"Akun Anda Terdaftar",

                    html:
                        "Nomor HP Anda terdaftar atas nama:<br><br>" +

                        "<b style='font-size:22px'>" +
                        (resAktivasi.nama || res.nama || "") +
                        "</b><br><br>" +

                        "Silakan login dengan password:<br>" +

                        "<b style='font-size:28px'>123456</b>",

                    confirmButtonText:"OK",

                    allowOutsideClick:false

                }).then(function(){

                    //==================================
                    // LANGSUNG TAMPILKAN KOLOM PASSWORD
                    //==================================

                    tampilPasswordWarga(
                        hp,
                        resAktivasi.nama || res.nama || ""
                    );

                });

            })

            .withFailureHandler(function(err){

                Swal.fire({
                    icon:"error",
                    title:"Aktivasi Gagal",
                    text:
                        err.message ||
                        "Terjadi kesalahan saat aktivasi."
                });

            })

            .aktivasiNomorHPWarga(
                res.id,
                hp
            );

            return;
        }

        //================================================
        // 3. AKUN NONAKTIF
        //================================================

        if(res.status == "NONAKTIF"){

            Swal.fire({

                icon:"warning",

                title:"Akun Nonaktif",

                text:
                    res.pesan ||
                    "Akun Anda sedang dinonaktifkan."

            });

            return;
        }


        //================================================
        // 4. NOMOR HP BELUM TERDAFTAR
        //================================================

        if(res.status == "TIDAK_DITEMUKAN"){

            HP_LOGIN = "";

            Swal.fire({

                icon:"info",

                title:"Nomor HP Belum Terdaftar",

                html:
                    "Nomor HP <b>"+hp+"</b> belum terdaftar.<br><br>" +
                    "Jika Anda sudah tercatat sebagai warga, " +
                    "Anda dapat melakukan aktivasi akun.",

                showCancelButton:true,

                confirmButtonText:"👤 Aktivasi Akun",

                cancelButtonText:"Batal"

            }).then(function(result){

                if(result.isConfirmed){

                    pilihNamaAktivasi(hp);

                }

            });

            return;
        }


        //================================================
        // 5. ERROR DARI SERVER
        //================================================

        Swal.fire({

            icon:"error",

            title:"Gagal",

            text:
                res.pesan ||
                "Status akun tidak dikenali."

        });

    })


    .withFailureHandler(function(err){

        Swal.fire({

            icon:"error",

            title:"Gagal",

            text:
                err && err.message
                ? err.message
                : "Gagal memeriksa nomor HP."

        });

    })


    .cekNomorHP(hp);

}

//==================================================
// TAMPILKAN FORM PASSWORD WARGA
// SETELAH NOMOR HP DIKONFIRMASI
//==================================================

function tampilPasswordWarga(hp, nama){

    // Simpan nomor HP untuk proses login
    HP_LOGIN = hp;

    // Sembunyikan semua form login warga
    document.getElementById("formWarga").style.display = "none";

    if(document.getElementById("formAktivasi")){
        document.getElementById("formAktivasi").style.display = "none";
    }

    // Langsung tampilkan form password
    document.getElementById("formPassword").style.display = "block";

    // Kosongkan password
    document.getElementById("passwordWarga").value = "";

    // Cursor langsung ke password
    setTimeout(function(){

        document.getElementById("passwordWarga").focus();

    },100);

}

//==================================================
// PILIH NAMA UNTUK AKTIVASI AKUN
//==================================================

function pilihNamaAktivasi(hp){

    Swal.fire({

        title:"Memuat Data Warga...",

        allowOutsideClick:false,

        didOpen:function(){
            Swal.showLoading();
        }

    });


    google.script.run

    .withSuccessHandler(function(data){

        Swal.close();


        //============================================
        // TIDAK ADA WARGA YANG BISA DIAKTIVASI
        //============================================

        if(!data || data.length==0){

            Swal.fire({

                icon:"info",

                title:"Data Tidak Ditemukan",

                html:
                    "Tidak ada data warga aktif "+
                    "yang belum memiliki nomor HP.<br><br>"+
                    "Silakan hubungi Admin RT."

            });

            return;

        }


        //============================================
        // BUAT DROPDOWN
        //============================================

        let options = {};

        data.forEach(function(w){

            options[w.id] =
                w.nama;

        });


        //============================================
        // TAMPILKAN PILIHAN NAMA
        //============================================

        Swal.fire({

            title:"👤 Pilih Nama Anda",

            text:"Pilih nama sesuai data warga.",

            input:"select",

            inputOptions:options,

            inputPlaceholder:"-- Pilih Nama --",

            showCancelButton:true,

            confirmButtonText:"LANJUT",

            cancelButtonText:"Batal",

            inputValidator:function(value){

                if(!value){

                    return "Silakan pilih nama Anda.";

                }

            }

        }).then(function(result){

            if(!result.isConfirmed){
                return;
            }


            const idWarga =
                result.value;


            //========================================
            // CARI NAMA YANG DIPILIH
            //========================================

            const wargaDipilih =
                data.find(function(w){

                    return String(w.id) ==
                           String(idWarga);

                });


            if(!wargaDipilih){

                Swal.fire({
                    icon:"error",
                    title:"Gagal",
                    text:"Data warga tidak ditemukan."
                });

                return;

            }


            konfirmasiAktivasiWarga(
                hp,
                wargaDipilih
            );

        });

    })

    .withFailureHandler(function(err){

        Swal.fire({

            icon:"error",

            title:"Gagal",

            text:err.message

        });

    })

    .getWargaBelumPunyaHP();

}

//==================================================
// KONFIRMASI AKTIVASI WARGA
//==================================================

function konfirmasiAktivasiWarga(hp,warga){

    Swal.fire({

        icon:"question",

        title:"Konfirmasi Data",

        html:
            "Anda terdaftar atas nama:<br><br>"+
            "<b style='font-size:22px'>"+
            warga.nama+
            "</b><br><br>"+
            "Nomor HP:<br>"+
            "<b>"+hp+"</b><br><br>"+
            "Apakah data tersebut benar?",

        showCancelButton:true,

        confirmButtonText:"✓ Ya, Benar",

        cancelButtonText:"Bukan Saya"

    }).then(function(result){

        if(result.isConfirmed){

            prosesAktivasiWarga(
                warga.id,
                hp
            );

        }

    });

}

//==================================================
// PROSES AKTIVASI AKUN WARGA
//==================================================

function prosesAktivasiWarga(idWarga,hp){

    Swal.fire({

        title:"Mengaktifkan Akun...",

        text:"Mohon tunggu.",

        allowOutsideClick:false,

        didOpen:function(){

            Swal.showLoading();

        }

    });


    google.script.run

    .withSuccessHandler(function(res){

        if(!res.status){

            Swal.fire({

                icon:"error",

                title:"Aktivasi Gagal",

                text:res.pesan

            });

            return;

        }


        //============================================
        // SIMPAN NOMOR HP UNTUK LOGIN
        //============================================

        HP_LOGIN = hp;


        //============================================
        // INFORMASI PASSWORD AWAL
        //============================================

        Swal.fire({

            icon:"success",

            title:"Aktivasi Berhasil",

            html:
                "Anda terdaftar atas nama:<br>"+
                "<b style='font-size:21px'>"+
                res.nama+
                "</b><br><br>"+

                "Akun SIWARGA Anda sudah aktif.<br><br>"+

                "Password awal Anda:<br>"+
                "<b style='font-size:28px'>"+
                "123456"+
                "</b><br><br>"+

                "Silakan gunakan password tersebut untuk login.",

            confirmButtonText:"LANJUT KE LOGIN"

        }).then(function(){

            //========================================
            // PINDAH KE FORM PASSWORD
            //========================================

            document.getElementById("formWarga")
                .style.display="none";

            document.getElementById("formPassword")
                .style.display="block";


            const inputPassword =
                document.getElementById("passwordWarga");

            inputPassword.value="";

            inputPassword.focus();

        });

    })

    .withFailureHandler(function(err){

        Swal.fire({

            icon:"error",

            title:"Aktivasi Gagal",

            text:err.message

        });

    })

    .aktivasiNomorHPWarga(
        idWarga,
        hp
    );

}

//==================================================
// LOGIN WARGA
//==================================================

function loginWarga(){

    const inputPassword =
        document.getElementById("passwordWarga");

    if(!inputPassword){

        Swal.fire({
            icon:"error",
            title:"Login Error",
            text:"Form password tidak ditemukan."
        });

        return;
    }


    const password =
        inputPassword.value.trim();


    //================================================
    // VALIDASI
    //================================================

    if(password==""){

        Swal.fire({
            icon:"warning",
            title:"Password kosong",
            text:"Silakan masukkan password."
        });

        return;
    }


    if(HP_LOGIN==""){

        Swal.fire({
            icon:"warning",
            title:"Nomor HP belum tersedia",
            text:"Silakan kembali dan masukkan nomor HP."
        });

        return;
    }


    //================================================
    // LOGIN KE SERVER
    //================================================

    google.script.run

    .withSuccessHandler(function(res){

        console.log("LOGIN WARGA =",res);


        //============================================
        // LOGIN GAGAL
        //============================================

        if(!res || !res.status){

            Swal.fire({
                icon:"error",
                title:"Login Gagal",
                text:"Password salah."
            });

            return;
        }


        //============================================
        // SIMPAN SESSION
        //============================================

        SESSION_LEVEL = res.level || "WARGA";

        SESSION_ID =
            res.id || "";

        SESSION_NAMA =
            res.nama || "";


        console.log(
            "SESSION_LEVEL =",
            SESSION_LEVEL
        );

        console.log(
            "SESSION_ID =",
            SESSION_ID
        );

        console.log(
            "SESSION_NAMA =",
            SESSION_NAMA
        );

        console.log(
            "FORCE CHANGE =",
            res.force
        );

        //============================================
        // PASSWORD NORMAL
        //============================================

        masukDashboardWarga();

    })


    //================================================
    // ERROR SERVER
    //================================================

    .withFailureHandler(function(err){

        console.error(
            "ERROR LOGIN WARGA =",
            err
        );

        Swal.fire({

            icon:"error",

            title:"Login Error",

            text:
                err && err.message
                ? err.message
                : "Terjadi kesalahan saat proses login."

        });

    })


    //================================================
    // PANGGIL LOGIN CODE.GS
    //================================================

    .login(
        String(HP_LOGIN).trim(),
        password
    );

}

//==================================================
// MASUK DASHBOARD WARGA
//==================================================

function masukDashboardWarga(){

    document.getElementById("loginPage")
        .style.display="none";

    document.getElementById("dashboardPage")
        .style.display="block";

    tampilMenuWarga();

}

//==================================================
// FORM GANTI PASSWORD AWAL
//==================================================

function formGantiPasswordAwal(){

    Swal.fire({

        title:"🔐 Buat Password Baru",

        html:`

            <div style="text-align:left;margin-top:15px;">

                <label>Password Baru</label>

                <input
                    type="password"
                    id="passwordBaruAwal"
                    class="swal2-input"
                    placeholder="Minimal 6 karakter"
                    style="
                        width:100%;
                        margin:8px 0 18px 0;
                        box-sizing:border-box;
                    ">


                <label>Konfirmasi Password</label>

                <input
                    type="password"
                    id="konfirmasiPasswordAwal"
                    class="swal2-input"
                    placeholder="Ulangi Password"
                    style="
                        width:100%;
                        margin:8px 0 0 0;
                        box-sizing:border-box;
                    ">

            </div>

        `,

        showCancelButton:true,

        confirmButtonText:"💾 Simpan Password",

        cancelButtonText:"Nanti Saja",

        allowOutsideClick:false,

        focusConfirm:false,


        preConfirm:function(){

            const baru =
                document
                .getElementById("passwordBaruAwal")
                .value.trim();

            const konfirmasi =
                document
                .getElementById("konfirmasiPasswordAwal")
                .value.trim();


            if(baru.length < 6){

                Swal.showValidationMessage(
                    "Password minimal 6 karakter."
                );

                return false;
            }


            if(baru=="123456"){

                Swal.showValidationMessage(
                    "Password baru tidak boleh 123456."
                );

                return false;
            }


            if(baru != konfirmasi){

                Swal.showValidationMessage(
                    "Konfirmasi password tidak sama."
                );

                return false;
            }


            return baru;

        }

    }).then(function(result){

        if(result.isConfirmed){

            simpanGantiPasswordAwal(
                result.value
            );

        }else{

            masukDashboardWarga();

        }

    });

}

//==================================================
// SIMPAN GANTI PASSWORD AWAL
//==================================================

function simpanGantiPasswordAwal(passwordBaru){

    Swal.fire({

        title:"Menyimpan Password...",

        text:"Mohon tunggu.",

        allowOutsideClick:false,

        didOpen:function(){

            Swal.showLoading();

        }

    });


    google.script.run

    .withSuccessHandler(function(res){

        if(!res || !res.status){

            Swal.fire({

                icon:"error",

                title:"Gagal",

                text:
                    res && res.pesan
                    ? res.pesan
                    : "Password gagal diubah."

            });

            return;
        }


        Swal.fire({

            icon:"success",

            title:"Password Berhasil Diubah",

            text:
                "Mulai login berikutnya gunakan password baru Anda.",

            confirmButtonText:"Lanjut"

        }).then(function(){

            masukDashboardWarga();

        });

    })


    .withFailureHandler(function(err){

        Swal.fire({

            icon:"error",

            title:"Gagal",

            text:
                err && err.message
                ? err.message
                : "Password gagal diubah."

        });

    })


    .ubahPasswordWarga(

        SESSION_ID,

        "123456",

        passwordBaru

    );

}

//==================================================
// TAMPIL / SEMBUNYIKAN PASSWORD WARGA
//==================================================

function togglePasswordWarga(){

    const input =
        document.getElementById("passwordWarga");

    const mata =
        document.getElementById("mataPasswordWarga");


    if(!input || !mata){
        return;
    }


    if(input.type === "password"){

        input.type = "text";

        mata.innerHTML = "🙈";

    }else{

        input.type = "password";

        mata.innerHTML = "👁️";

    }

}

//==================================================
// LUPA PASSWORD
//==================================================

function lupaPassword(){

    if(HP_LOGIN==""){

        Swal.fire({
            icon:"warning",
            title:"Nomor HP belum dipilih",
            text:"Silakan masukkan Nomor HP terlebih dahulu."
        });

        return;

    }

    Swal.fire({

        icon:"question",

        title:"Reset Password",

        html:
        "Nomor HP : <b>"+HP_LOGIN+"</b><br><br>"+
        "Kirim permintaan reset password ke Admin?",

        showCancelButton:true,

        confirmButtonText:"Ya",

        cancelButtonText:"Batal"

    }).then(function(result){

        if(!result.isConfirmed) return;

        google.script.run

        .withSuccessHandler(function(res){

            if(res.status){

                Swal.fire({

                    icon:"success",

                    title:"Permintaan Terkirim",

                    html:
                    "Permintaan reset password berhasil dikirim.<br><br>"+
                    "Silakan menunggu persetujuan Admin."

                });

            }else{

                Swal.fire({

                    icon:"error",

                    title:"Gagal",

                    text:res.pesan

                });

            }

        })

        .requestResetPassword(HP_LOGIN);

    });

}

//==================================================
// FORM UBAH PASSWORD WARGA
//==================================================

function formUbahPasswordWarga(){

    Swal.fire({

        title:"🔐 Ubah Password",

        html:`

            <div style="text-align:left;margin-top:15px;">

                <label>Password Lama</label>

                <input
                    type="password"
                    id="passwordLama"
                    class="swal2-input"
                    placeholder="Password Lama"
                    style="width:100%;margin:8px 0 18px 0;">


                <label>Password Baru</label>

                <input
                    type="password"
                    id="passwordBaru"
                    class="swal2-input"
                    placeholder="Password Baru"
                    style="width:100%;margin:8px 0 18px 0;">


                <label>Konfirmasi Password Baru</label>

                <input
                    type="password"
                    id="konfirmasiPassword"
                    class="swal2-input"
                    placeholder="Konfirmasi Password"
                    style="width:100%;margin:8px 0 0 0;">

            </div>

        `,

        showCancelButton:true,

        confirmButtonText:"💾 Simpan",

        cancelButtonText:"Batal",

        focusConfirm:false,


        preConfirm:()=>{

            const lama =
                document.getElementById("passwordLama").value.trim();

            const baru =
                document.getElementById("passwordBaru").value.trim();

            const konfirmasi =
                document.getElementById("konfirmasiPassword").value.trim();


            if(lama==""){

                Swal.showValidationMessage(
                    "Password lama harus diisi."
                );

                return false;

            }


            if(baru.length < 6){

                Swal.showValidationMessage(
                    "Password baru minimal 6 karakter."
                );

                return false;

            }


            if(baru != konfirmasi){

                Swal.showValidationMessage(
                    "Konfirmasi password tidak sama."
                );

                return false;

            }


            return {
                lama:lama,
                baru:baru
            };

        }

    }).then(function(result){

        if(!result.isConfirmed){
            return;
        }


        Swal.fire({

            title:"Menyimpan...",

            text:"Mohon tunggu.",

            allowOutsideClick:false,

            didOpen:()=>{
                Swal.showLoading();
            }

        });


        google.script.run

        .withSuccessHandler(function(res){

            if(res.status){

                Swal.fire({
                    icon:"success",
                    title:"Berhasil",
                    text:res.pesan
                });

            }else{

                Swal.fire({
                    icon:"error",
                    title:"Gagal",
                    text:res.pesan
                });

            }

        })

        .withFailureHandler(function(err){

            Swal.fire({
                icon:"error",
                title:"Error",
                text:err.message
            });

        })

        .ubahPasswordWarga(
            SESSION_ID,
            result.value.lama,
            result.value.baru
        );

    });

}

function simpanPasswordBaru(){

    let p1 = document.getElementById("pass1").value.trim();

    let p2 = document.getElementById("pass2").value.trim();

    if(p1==""){

        Swal.fire({
            icon:"warning",
            title:"Password Kosong",
            text:"Silakan isi password."
        });

        return;

    }

    if(p1!=p2){

        Swal.fire({
            icon:"warning",
            title:"Konfirmasi Password",
            text:"Password dan konfirmasi password tidak sama."
        });

        return;

    }

    google.script.run

    .withSuccessHandler(function(res){

        if(!res){

            Swal.fire({
                icon:"error",
                title:"Gagal",
                text:"Password gagal disimpan."
            });

            return;

        }

        Swal.fire({
            icon:"success",
            title:"Aktivasi Berhasil",
            text:"Silakan login menggunakan password yang baru dibuat."
        }).then(function(){

            // Bersihkan password
            document.getElementById("pass1").value="";
            document.getElementById("pass2").value="";

            // Langsung ke form login password
            tampilForm("formPassword");

        });

    })

    .simpanPasswordPertama(
        HP_LOGIN,
        p1
    );

}

function menuResetPassword(){

    aktifkanMenu("reset");

    google.script.run

    .withSuccessHandler(function(data){

        let html="";

        html+="<div class='card'>";

        html+="<h2>🔑 Permintaan Reset Password</h2><br>";

        if(data.length==0){

            html+="Tidak ada permintaan reset password.";

        }else{

            html+="<table class='tbl'>";

            html+="<thead>";
            html+="<tr>";
            html+="<th>No</th>";
            html+="<th>Tanggal</th>";
            html+="<th>Nama</th>";
            html+="<th>HP</th>";
            html+="<th>Status</th>";
            html+="<th>Aksi</th>";
            html+="</tr>";
            html+="</thead>";

            html+="<tbody>";

            data.forEach(function(r,i){

                html+="<tr>";

                html+="<td>"+(i+1)+"</td>";
                html+="<td>"+r.tanggal+"</td>";
                html+="<td>"+r.nama+"</td>";
                html+="<td>"+r.hp+"</td>";
                html+="<td>"+r.status+"</td>";

                html+="<td>";

                if(r.status=="MENUNGGU"){

                    html+="<button onclick=\"setujuiReset("+r.row+")\">✅ Setujui</button> ";

                    html+="<button onclick=\"tolakReset("+r.row+")\">❌ Tolak</button>";

                }

                html+="</td>";

                html+="</tr>";

            });

            html+="</tbody>";

            html+="</table>";

        }

        html+="</div>";

        document.getElementById("content").innerHTML=html;

    })

    .getResetPasswordRequest();

}

function setujuiReset(row){

    Swal.fire({

        title:"Setujui reset password?",

        text:"Password lama akan dihapus.",

        icon:"question",

        showCancelButton:true,

        confirmButtonText:"Setujui",

        cancelButtonText:"Batal"

    }).then(function(result){

        if(!result.isConfirmed) return;

        google.script.run

        .withSuccessHandler(function(ok){

            if(ok){

                Swal.fire({

                    icon:"success",

                    title:"Berhasil",

                    text:"Reset password telah disetujui."

                });

                menuResetPassword();
                refreshBadgeReset();

            }else{

                Swal.fire({

                    icon:"error",

                    title:"Gagal",

                    text:"Data tidak ditemukan."

                });

            }

        })

        .setujuiReset(row);

    });

}

function tolakReset(row){

    Swal.fire({

        title:"Tolak permintaan?",

        icon:"warning",

        showCancelButton:true,

        confirmButtonText:"Tolak",

        cancelButtonText:"Batal"

    }).then(function(result){

        if(!result.isConfirmed) return;

        google.script.run

        .withSuccessHandler(function(ok){

            if(ok){

                Swal.fire({

                    icon:"success",

                    title:"Selesai",

                    text:"Permintaan ditolak."

                });

                menuResetPassword();
                refreshBadgeReset();

            }

        })

        .tolakReset(row);

    });

}

function refreshBadgeReset(){

    google.script.run

    .withSuccessHandler(function(jumlah){

        const btn = document.getElementById("btnReset");

        if(!btn) return;

        if(jumlah==0){

            btn.innerHTML="🔑 Reset Password";

        }else{

            btn.innerHTML=
            "🔑 Reset Password <span class='badgeMenu'>"+
            jumlah+
            "</span>";

        }

    })

    .getJumlahResetMenunggu();

}

function hubungiAdmin(admin,hp){

    let nomor = String(admin.wa).trim();

    // Ubah 0813xxxx menjadi 62813xxxx
    if(nomor.startsWith("0")){

        nomor = "62" + nomor.substring(1);

    }

    let pesan =
        "Halo " + admin.nama + ",\n\n" +
        "Nomor HP saya " + hp +
        " belum terdaftar di SIWARGA.\n\n" +
        "Mohon dibantu untuk pendaftaran akun.";

    let url;

    // Jika dibuka dari HP
    if(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)){

        url =
        "https://wa.me/" +
        nomor +
        "?text=" +
        encodeURIComponent(pesan);

    }

    // Jika dibuka dari Laptop / PC
    else{

        url =
        "https://web.whatsapp.com/send?phone=" +
        nomor +
        "&text=" +
        encodeURIComponent(pesan);

    }

    window.open(url,"_blank");

}
