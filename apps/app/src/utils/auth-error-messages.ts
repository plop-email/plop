type AuthErrorLike = {
  message?: string;
  code?: string;
  name?: string;
  status?: number;
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  anonymous_provider_disabled: "Anonymous sign-in is disabled.",
  bad_code_verifier: "The verification code is invalid or expired.",
  bad_json: "We couldn't process that request. Please try again.",
  bad_jwt: "Your session is invalid or expired. Please sign in again.",
  bad_oauth_callback: "OAuth callback failed. Please try again.",
  bad_oauth_state: "OAuth state mismatch. Please try again.",
  captcha_failed: "Captcha verification failed. Please try again.",
  conflict: "A conflicting request was detected. Please retry.",
  email_address_invalid: "Enter a valid email address.",
  email_address_not_authorized:
    "This email address is not authorized to sign up.",
  email_conflict_identity_not_deletable:
    "An existing identity prevents this change. Contact support.",
  email_exists: "An account with this email already exists.",
  email_not_confirmed: "Please confirm your email before signing in.",
  email_provider_disabled: "Email sign-in is disabled.",
  flow_state_expired: "This verification link has expired. Request a new one.",
  flow_state_not_found: "This verification link is invalid. Request a new one.",
  hook_payload_over_size_limit:
    "The auth hook payload is too large. Please try again later.",
  hook_timeout: "The auth hook timed out. Please try again.",
  hook_timeout_after_retry:
    "The auth hook timed out after retries. Please try again later.",
  identity_already_exists:
    "That identity is already linked to another account.",
  identity_not_found: "We couldn't find that identity.",
  insufficient_aal: "Additional verification is required to continue.",
  invite_not_found: "This invite link is invalid or expired.",
  invalid_credentials: "Incorrect email or password.",
  invalid_email: "Enter a valid email address.",
  invalid_flow_state: "This verification link is invalid. Request a new one.",
  invalid_grant: "The authentication grant is invalid or expired.",
  invalid_jwt: "Your session is invalid or expired. Please sign in again.",
  invalid_phone: "Enter a valid phone number.",
  invalid_recovery_token: "This recovery link or code is invalid.",
  invalid_refresh_token: "Your session expired. Please sign in again.",
  invalid_request: "Invalid request. Please try again.",
  invalid_signup: "Signup is not allowed with this configuration.",
  invalid_token: "This link or code is invalid.",
  invalid_user: "This user is not valid.",
  mfa_challenge_expired: "The MFA challenge expired. Try again.",
  mfa_factor_not_found: "We couldn't find that MFA factor.",
  mfa_verification_failed: "MFA verification failed. Try again.",
  mfa_verification_rejected: "MFA verification was rejected. Try again.",
  mfa_verification_timeout: "MFA verification timed out. Try again.",
  missing_email_or_phone: "Enter an email or phone number.",
  missing_phone: "Enter a phone number.",
  no_authorization: "You're not authorized to perform this action.",
  oauth_provider_not_supported: "That OAuth provider isn't supported.",
  otp_expired: "The code has expired. Request a new one.",
  otp_disabled: "Email or phone OTP is disabled.",
  otp_rate_limit_exceeded: "Too many OTP attempts. Please wait and try again.",
  over_email_send_rate_limit:
    "Too many emails sent. Please wait and try again.",
  over_request_rate_limit: "Too many requests. Please wait and try again.",
  over_sms_send_rate_limit: "Too many SMS sent. Please wait and try again.",
  phone_exists: "An account with this phone number already exists.",
  phone_not_confirmed: "Please confirm your phone number before signing in.",
  provider_disabled: "This auth provider is disabled.",
  provider_email_needs_verification:
    "Verify your email with the provider before continuing.",
  reauthentication_needed: "Please reauthenticate to continue.",
  reauthentication_not_valid: "Reauthentication failed. Please sign in again.",
  request_timeout: "The request timed out. Please try again.",
  same_password: "Your new password must be different from the current one.",
  saml_assertion_no_email: "SAML assertion is missing an email.",
  saml_assertion_no_user_id: "SAML assertion is missing a user ID.",
  saml_entity_id_mismatch: "SAML entity ID mismatch.",
  saml_idp_already_exists: "A SAML identity provider already exists.",
  saml_idp_not_found: "SAML identity provider not found.",
  saml_metadata_fetch_failed: "Unable to fetch SAML metadata.",
  saml_provider_disabled: "SAML provider is disabled.",
  saml_relay_state_expired: "SAML relay state expired. Try again.",
  saml_relay_state_not_found: "SAML relay state not found.",
  session_not_found: "Session not found. Please sign in again.",
  signup_disabled: "Signups are disabled.",
  single_identity_not_deletable:
    "Cannot delete the last identity on this account.",
  sms_send_failed: "We couldn't send the SMS. Try again.",
  sso_domain_already_exists:
    "An SSO configuration already exists for that domain.",
  sso_provider_not_found: "SSO provider not found.",
  unexpected_audience: "Unexpected audience in token.",
  unexpected_failure: "Something went wrong. Please try again.",
  user_already_exists: "An account with this email already exists.",
  user_banned: "This account has been disabled. Contact support.",
  user_not_found: "No account found for this email.",
  user_sso_managed: "This account is managed by SSO. Use your SSO provider.",
  validation_failed:
    "Some information was invalid. Check your details and try again.",
  weak_password: "Password is too weak. Please choose a stronger one.",
};

const AUTH_ERROR_NAMES: Record<string, string> = {
  AuthWeakPasswordError: "Password is too weak. Please choose a stronger one.",
  AuthSessionMissingError: "Your session expired. Please sign in again.",
  AuthInvalidCredentialsError: "Incorrect email or password.",
  AuthRetryableFetchError:
    "We couldn't reach the server. Check your connection and try again.",
};

export function getAuthErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const err = error as AuthErrorLike;

  if (err.code) {
    const codeMessage = AUTH_ERROR_MESSAGES[err.code];
    if (codeMessage) {
      return codeMessage;
    }
  }

  if (err.name) {
    const nameMessage = AUTH_ERROR_NAMES[err.name];
    if (nameMessage) {
      return nameMessage;
    }
  }

  if (err.message?.toLowerCase().includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }

  return err.message || fallback;
}
