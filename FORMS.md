# Form submissions

All enquiries and job applications are submitted through **Web3Forms**.

- Endpoint: `https://api.web3forms.com/submit`
- Access key: configured in each form’s `access_key` hidden field (same key used across the site)
- Delivery: submissions are emailed to the inbox linked to that Web3Forms key and are visible in the Web3Forms dashboard
- Client behaviour: `script.js` validates required fields inline, then submits with a native `POST` (plus an absolute `redirect` URL) so applicants land on a success page after Web3Forms accepts the payload

## Forms

| Form | Page | Subject tag |
|------|------|-------------|
| Voice consultation | `/consultation/` & `/contact/` | New AI Voice Consultation Booking — CCM |
| Partner enquiry | `/contact/` | New Partnership & Commercial Enquiry — CCM |
| Sales representative application | `/careers/apply/` | New Sales Representative Application — CCM |

## Activating / changing delivery

1. Sign in at [web3forms.com](https://web3forms.com/) with the account that owns the access key.
2. Confirm the destination email (currently expected: Collabcreatemarketing@gmail.com).
3. Ensure the production domain is allowed in the Web3Forms project settings if domain restriction is enabled.
4. To rotate the key, replace the `access_key` value in every form (search the repo for `access_key`).

No additional server or database is required for the static GitHub Pages deployment. Application data is persisted via Web3Forms (email + dashboard), not discarded in the browser.

**Note:** Automated headless browsers may be challenged by Cloudflare in front of the Web3Forms API. Real user browsers on the live domain complete the POST and follow the redirect to `/careers/success/` or `/contact/success/`.
