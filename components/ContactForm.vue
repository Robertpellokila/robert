<script setup lang="ts">
import { computed, ref } from 'vue'
import { owner } from '~/data/portfolio'
import { createWhatsAppLink, normalizeWhatsAppNumber } from '~/utils/whatsapp'

/**
 * An email-client based form. It composes a draft and opens the user's mail app.
 * No message is sent or stored by the website. For direct submissions, add a
 * server endpoint + email provider with server-side validation/rate limiting.
 */
const name = ref('')
const email = ref('')
const topic = ref('Collaboration')
const message = ref('')
const status = ref('')
const emailConfigured = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner.email))
const whatsappConfigured = computed(() => !!normalizeWhatsAppNumber(owner.whatsapp))

function composeMailto(): string {
  const subject = `[My Little World] ${topic.value} — ${name.value.trim()}`
  const body = [
    `Hi ${owner.name},`,
    '',
    message.value.trim(),
    '',
    `From: ${name.value.trim()}`,
    `Reply to: ${email.value.trim()}`,
    `Topic: ${topic.value}`,
  ].join('\n')
  return `mailto:${owner.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function openWhatsApp() {
  if (!whatsappConfigured.value) {
    status.value = 'Nomor WhatsApp belum diatur. Isi owner.whatsapp di data/portfolio.ts.'
    return
  }
  const text = [
    `Halo ${owner.name}! Saya melihat My Little World dan ingin menghubungi kamu.`,
    message.value.trim() ? `Pesan: ${message.value.trim()}` : 'Saya tertarik untuk berdiskusi tentang ide atau kolaborasi.',
    name.value.trim() ? `Nama: ${name.value.trim()}` : '',
    email.value.trim() ? `Email: ${email.value.trim()}` : '',
    `Topik: ${topic.value}`,
  ].filter(Boolean).join('\n\n')
  const link = createWhatsAppLink(owner.whatsapp, text)
  if (!link) return
  window.open(link, '_blank', 'noopener,noreferrer')
  status.value = 'WhatsApp telah dibuka. Periksa pesannya, lalu tekan Kirim secara manual.'
}

function openEmailClient() {
  if (!emailConfigured.value) {
    status.value = 'Email tujuan belum diatur. Isi owner.email di data/portfolio.ts terlebih dahulu.'
    return
  }
  status.value = 'Draft siap. Periksa aplikasi emailmu dan tekan Send untuk benar-benar mengirim.'
  window.location.href = composeMailto()
}

async function copyEmail() {
  if (!emailConfigured.value) return
  try {
    await navigator.clipboard.writeText(owner.email)
    status.value = 'Alamat email berhasil disalin.'
  } catch {
    status.value = `Salin alamat ini secara manual: ${owner.email}`
  }
}
</script>

<template>
  <div class="contact-form-card">
    <div class="contact-form-eyebrow"><span class="contact-form-dot" /> OPEN FOR COLLABORATION</div>
    <h3>Let's brew an idea together.</h3>
    <p class="contact-form-lead">Ceritakan ide, kesempatan kerja, atau proyekmu. Aku senang membaca cerita di balik setiap ide.</p>
    <form class="contact-form-fields" @submit.prevent="openEmailClient">
      <div class="contact-form-row">
        <label>Nama kamu <span>*</span><input v-model.trim="name" name="name" autocomplete="name" required maxlength="100" placeholder="Nama lengkap" /></label>
        <label>Email kamu <span>*</span><input v-model.trim="email" name="email" type="email" autocomplete="email" required maxlength="180" placeholder="nama@email.com" /></label>
      </div>
      <label>Apa yang ingin dibicarakan?
        <select v-model="topic" name="topic">
          <option>Collaboration</option><option>Freelance project</option><option>Job opportunity</option><option>Say hello</option>
        </select>
      </label>
      <label>Pesan kamu <span>*</span>
        <textarea v-model.trim="message" name="message" rows="5" required minlength="10" maxlength="3000" placeholder="Halo! Aku punya ide tentang..."></textarea>
      </label>
      <div class="contact-form-footer">
        <button type="button" class="contact-form-whatsapp" :disabled="!whatsappConfigured" @click="openWhatsApp">Chat via WhatsApp <span aria-hidden="true">↗</span></button>
        <button type="submit" :disabled="!emailConfigured">Buka draft email <span aria-hidden="true">↗</span></button>
        <button type="button" class="contact-form-copy" :disabled="!emailConfigured" @click="copyEmail">Salin alamat email</button>
      </div>
      <p v-if="status" class="contact-form-status" role="status">{{ status }}</p>
      <p v-else class="contact-form-help">Pesan akan dibuka di aplikasi emailmu untuk diperiksa sebelum dikirim. Form ini belum mengirim otomatis.</p>
      <p v-if="!whatsappConfigured" class="contact-form-warning">Isi <code>owner.whatsapp</code> di <code>data/portfolio.ts</code> untuk mengaktifkan WhatsApp.</p>
      <p v-if="!emailConfigured" class="contact-form-warning">Atur alamat email tujuan di <code>data/portfolio.ts</code> agar form email aktif.</p>
    </form>
  </div>
</template>

<style scoped>
.contact-form-card{--accent:#365e47;background:#fffdf8;border:1px solid #dfebdd;border-radius:22px;padding:clamp(20px,3vw,32px);box-shadow:0 16px 45px #263b2b14;color:#294536;text-align:left;max-width:780px}
.contact-form-eyebrow{display:flex;align-items:center;gap:9px;letter-spacing:.14em;font-weight:800;font-size:10px;color:#64836b}
.contact-form-dot{width:8px;height:8px;border-radius:50%;background:#86b88e;box-shadow:0 0 0 5px #e8f3e6}
h3{font-family:'Space Grotesk',sans-serif;font-size:clamp(25px,3vw,38px);letter-spacing:-.055em;line-height:1.15;color:#254a36;margin:18px 0 10px}
.contact-form-lead{font-size:13px!important;line-height:1.7!important;color:#718577!important;margin:0 0 22px!important}
.contact-form-fields{display:grid;gap:16px}
.contact-form-row{display:grid;grid-template-columns:1fr 1fr;gap:15px}
label{display:grid;gap:7px;font-size:12px;font-weight:800;color:#476550}
label span{color:#9a654c}
input,select,textarea{box-sizing:border-box;width:100%;min-width:0;border:1px solid #d7e2d8;border-radius:10px;padding:13px 14px;background:#f8faf5;color:#273f32;font:inherit;font-size:13px;font-weight:500;outline-offset:2px;transition:border-color .2s,box-shadow .2s}
input:focus,select:focus,textarea:focus{border-color:#6c9979;outline:2px solid #e1efde;box-shadow:0 0 0 3px #dcebd6}
textarea{resize:vertical;min-height:115px}
.contact-form-footer{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:3px}
.contact-form-footer button{appearance:none;cursor:pointer;border-radius:10px;padding:13px 18px;font:inherit;font-size:12px;font-weight:800;border:1px solid #365e47;background:#365e47;color:white;min-height:44px}
.contact-form-footer button span{margin-left:10px;color:white}
.contact-form-footer .contact-form-whatsapp{background:#237a4f;border-color:#237a4f;color:white}
.contact-form-footer .contact-form-copy{background:transparent;color:#3f6650;border-color:#d4e4d5}
.contact-form-footer button:hover:not(:disabled){filter:brightness(1.08)}
.contact-form-footer button:disabled{opacity:.45;cursor:not-allowed}
.contact-form-help,.contact-form-status,.contact-form-warning{font-size:11px!important;line-height:1.7!important;color:#718577!important;margin:0!important}
.contact-form-status{color:#426e4b!important}.contact-form-warning{color:#a65b45!important}
@media(max-width:620px){.contact-form-row{grid-template-columns:1fr}.contact-form-footer{flex-direction:column;align-items:stretch}.contact-form-footer button{width:100%}}
</style>
