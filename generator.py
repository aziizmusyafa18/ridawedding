
import urllib.parse

# --- KONFIGURASI ---

# URL dasar undangan Anda (host tempat index.html di-deploy, mis. GitHub Pages / Netlify / dst).
# WAJIB diakhiri "/" supaya link "<url>#nama" tetap valid.
BASE_INVITATION_URL = "https://ridawedding.vercel.app/"

# Nama file input dan output
GUESTS_FILE = "tamu.txt"
OUTPUT_FILE = "hasil.txt"

# Nama mempelai untuk template pesan
NAMA_PRIA  = "Muhammad Rizqi Mubarok"
NAMA_WANITA = "Asfida Rahma"
SIGNATURE  = "Rizqi & Asfida"

# Template pesan WhatsApp
# Anda bisa mengubah isi pesan di bawah ini jika perlu
MESSAGE_TEMPLATE = f"""Assalamualaikum Warahmatullahi Wabarakaatuh,

Kepada Yth. *{{guest_name}}*

Dengan menghormati, kami mohon rahmat dan ridho Allah SWT,
perkenankan kami mengundang Saudara/i untuk hadir dalam
bahagia pernikahan kami :

🤵🏻 *{NAMA_PRIA}*

dengan

🧕🏻 *{NAMA_WANITA}*

📅 Sabtu, 20 Juni 2026
🕒 Pukul 09.00 WIB — Selesai
📍 Pendopo Among Tani, Jl. Kaliurang KM 9, Sleman, DIY

🔗 Klik link di bawah untuk detail undangan, konfirmasi kehadiran,
dan ucapan restu Anda :

*{{invitation_link}}*

Kehadiran dan doa restu Bapak/Ibu/Saudara/i adalah kebahagiaan
bagi kami. Atas kehadirannya kami ucapkan terima kasih.

_Wassalamualaikum Warahmatullahi Wabarakaatuh_

Hormat kami,
*{SIGNATURE}*"""

# --- SCRIPT UTAMA (JANGAN DIUBAH) ---

def generate_links():
    """
    Membaca nama tamu, membuat link WhatsApp, dan menyimpannya ke file output.
    """
    try:
        with open(GUESTS_FILE, 'r', encoding='utf-8') as f_in, \
             open(OUTPUT_FILE, 'w', encoding='utf-8') as f_out:
            
            print(f"Membaca nama dari '{GUESTS_FILE}'...")
            f_out.write("Link WhatsApp yang sudah jadi:\n")
            f_out.write("===============================\n\n")

            count = 0
            for name in f_in:
                guest_name = name.strip()
                if not guest_name:
                    continue

                # 1. Buat link undangan unik dengan hash
                encoded_guest_name = urllib.parse.quote(guest_name)
                invitation_link = f"{BASE_INVITATION_URL}#{encoded_guest_name}"

                # 2. Buat pesan WhatsApp lengkap
                message_text = MESSAGE_TEMPLATE.format(
                    guest_name=guest_name,
                    invitation_link=invitation_link
                )

                # 3. Encode seluruh pesan untuk URL WhatsApp
                encoded_message = urllib.parse.quote(message_text)

                # 4. Buat link WhatsApp final
                whatsapp_link = f"https://wa.me/?text={encoded_message}"

                # 5. Tulis hasilnya ke file output
                f_out.write(f"Untuk: {guest_name}\n")
                f_out.write(f"{whatsapp_link}\n\n")
                count += 1
        
        print(f"\nBerhasil! {count} link telah dibuat dan disimpan di file '{OUTPUT_FILE}'")

    except FileNotFoundError:
        print(f"\nError: File '{GUESTS_FILE}' tidak ditemukan. Mohon buat file tersebut terlebih dahulu.")
    except Exception as e:
        print(f"\nTerjadi error: {e}")

if __name__ == "__main__":
    generate_links()
