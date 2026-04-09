import { create } from 'zustand';

const useConfigStore = create((set) => ({
  subscriptionRequired:     true,
  esewaEnabled:             false,
  emailVerificationEnabled: true,
  loaded: false,

  // Contact / social info
  contactEmail:    'nebexamofficial@gmail.com',
  contactPhone:    '9745450062',
  contactAddress:  '',
  contactWa:       '9779745450062',
  socialFacebook:  '',
  socialInstagram: '',

  // Lead form
  leadFormEnabled: false,
  leadFormTitle:   'Planning to Study Abroad?',
  leadFormImage:   null,

  setConfig: (data) =>
    set({
      subscriptionRequired:     data.subscription_required      ?? true,
      esewaEnabled:             data.esewa_enabled              ?? false,
      emailVerificationEnabled: data.email_verification_enabled ?? true,
      contactEmail:             data.contact_email    ?? 'nebexamofficial@gmail.com',
      contactPhone:             data.contact_phone    ?? '9745450062',
      contactAddress:           data.contact_address  ?? '',
      contactWa:                data.contact_wa       ?? '9779745450062',
      socialFacebook:           data.social_facebook  ?? '',
      socialInstagram:          data.social_instagram ?? '',
      leadFormEnabled:          data.lead_form_enabled ?? false,
      leadFormTitle:            data.lead_form_title   ?? 'Planning to Study Abroad?',
      leadFormImage:            data.lead_form_image   ?? null,
      loaded: true,
    }),
}));

export default useConfigStore;
