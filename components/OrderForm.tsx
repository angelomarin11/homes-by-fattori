"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Reveal from "./Reveal";

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  property: string;
  format: string;
  framing: string;
  source: string;
  notes: string;
  agree: boolean;
};

export default function OrderForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      country: "",
      source: "",
    },
  });

  const [submitted, setSubmitted] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setServerError(
          body.error ?? "Something went wrong. Please try again."
        );
        return;
      }

      setSubmitted(values.fullName);
      reset();
    } catch {
      setServerError(
        "We couldn't reach the server. Please try again, or email hello@homesbyfattori.com."
      );
    }
  };

  const inputClass =
    "w-full border border-navy/20 bg-white px-4 py-3 font-inter text-sm text-navy placeholder:text-navy/40 outline-none transition-colors focus:border-gold";
  const labelClass =
    "mb-2 block font-inter text-xs uppercase tracking-[0.14em] text-navy/70";
  const errorClass = "mt-1 font-inter text-xs text-red-700";

  return (
    <section id="order" className="bg-creamdark py-24 md:py-32">
      <div className="container-luxe">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-5">Commission</p>
          <h2 className="section-title mb-4">Commission Your Portrait</h2>
          <p className="font-cormorant text-xl italic text-graytext">
            Tell us about your home and we&rsquo;ll be in touch within 24 hours.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          {/* Form / success */}
          <Reveal>
            {submitted ? (
              <div className="flex h-full flex-col items-start justify-center border border-gold/40 bg-white p-10">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#B89650"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-6 h-12 w-12"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12l3 3 5-6" />
                </svg>
                <h3 className="font-playfair text-3xl text-navy">
                  Thank you, {submitted}.
                </h3>
                <p className="mt-4 font-cormorant text-xl italic text-graytext">
                  We&rsquo;ll be in touch within 24 hours to begin your portrait.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(null)}
                  className="link-arrow mt-8 text-lg"
                >
                  Submit another enquiry <span aria-hidden>&rarr;</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="grid grid-cols-1 gap-6 sm:grid-cols-2"
              >
                {/* Full name */}
                <div>
                  <label className={labelClass} htmlFor="fullName">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    className={inputClass}
                    placeholder="Jane Doe"
                    {...register("fullName", {
                      required: "Please enter your name.",
                    })}
                  />
                  {errors.fullName && (
                    <p className={errorClass}>{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className={labelClass} htmlFor="email">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={inputClass}
                    placeholder="jane@email.com"
                    {...register("email", {
                      required: "Please enter your email.",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email.",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className={errorClass}>{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className={labelClass} htmlFor="phone">
                    Phone / WhatsApp (optional)
                  </label>
                  <input
                    id="phone"
                    className={inputClass}
                    placeholder="+1 555 000 0000"
                    {...register("phone")}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className={labelClass} htmlFor="country">
                    Country *
                  </label>
                  <select
                    id="country"
                    className={inputClass}
                    {...register("country", {
                      required: "Please select your country.",
                    })}
                  >
                    <option value="">Select…</option>
                    <option>United States</option>
                    <option>Brazil</option>
                    <option>United Kingdom</option>
                    <option>Other</option>
                  </select>
                  {errors.country && (
                    <p className={errorClass}>{errors.country.message}</p>
                  )}
                </div>

                {/* Property */}
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="property">
                    Property Address or Description *
                  </label>
                  <textarea
                    id="property"
                    rows={2}
                    className={inputClass}
                    placeholder="e.g. Colonial manor, Greenwich CT — two storeys, brick facade"
                    {...register("property", {
                      required: "Please describe your property.",
                    })}
                  />
                  {errors.property && (
                    <p className={errorClass}>{errors.property.message}</p>
                  )}
                </div>

                {/* Format */}
                <fieldset>
                  <legend className={labelClass}>Format *</legend>
                  <div className="flex gap-5">
                    {["A4", "A3", "A2"].map((f) => (
                      <label
                        key={f}
                        className="flex items-center gap-2 font-inter text-sm text-navy"
                      >
                        <input
                          type="radio"
                          value={f}
                          className="accent-gold"
                          {...register("format", {
                            required: "Please choose a format.",
                          })}
                        />
                        {f}
                      </label>
                    ))}
                  </div>
                  {errors.format && (
                    <p className={errorClass}>{errors.format.message}</p>
                  )}
                </fieldset>

                {/* Framing */}
                <fieldset>
                  <legend className={labelClass}>Framing *</legend>
                  <div className="flex flex-wrap gap-4">
                    {["Unframed", "Framed", "Not sure yet"].map((f) => (
                      <label
                        key={f}
                        className="flex items-center gap-2 font-inter text-sm text-navy"
                      >
                        <input
                          type="radio"
                          value={f}
                          className="accent-gold"
                          {...register("framing", {
                            required: "Please choose a framing option.",
                          })}
                        />
                        {f}
                      </label>
                    ))}
                  </div>
                  {errors.framing && (
                    <p className={errorClass}>{errors.framing.message}</p>
                  )}
                </fieldset>

                {/* Source */}
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="source">
                    How did you hear about us?
                  </label>
                  <select
                    id="source"
                    className={inputClass}
                    {...register("source")}
                  >
                    <option value="">Select…</option>
                    <option>Instagram</option>
                    <option>Realtor referral</option>
                    <option>Google</option>
                    <option>Friend</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="notes">
                    Additional notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className={inputClass}
                    placeholder="Anything else we should know? Special details, deadlines, figures to include…"
                    {...register("notes")}
                  />
                </div>

                {/* Agree */}
                <div className="sm:col-span-2">
                  <label className="flex items-start gap-3 font-inter text-sm text-graytext">
                    <input
                      type="checkbox"
                      className="mt-1 accent-gold"
                      {...register("agree", {
                        required:
                          "Please agree to the Terms & Conditions and Privacy Policy.",
                      })}
                    />
                    <span>
                      I agree to the Terms &amp; Conditions and Privacy Policy. *
                    </span>
                  </label>
                  {errors.agree && (
                    <p className={errorClass}>{errors.agree.message}</p>
                  )}
                </div>

                {serverError && (
                  <div className="sm:col-span-2">
                    <p className="border border-red-300 bg-red-50 px-4 py-3 font-inter text-sm text-red-700">
                      {serverError}
                    </p>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gold w-full !py-5 text-base disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "Sending…"
                      : "Submit — Commission My Portrait"}
                  </button>
                </div>
              </form>
            )}
          </Reveal>

          {/* Sidebar */}
          <Reveal delay={0.1}>
            <aside className="space-y-8 border-l border-gold/30 pl-8">
              <div>
                <p className="font-inter text-xs uppercase tracking-[0.16em] text-gold">
                  Questions?
                </p>
                <a
                  href="mailto:hello@homesbyfattori.com"
                  className="mt-2 block font-cormorant text-2xl italic text-navy transition-colors hover:text-gold"
                >
                  hello@homesbyfattori.com
                </a>
              </div>

              <div>
                <p className="font-inter text-xs uppercase tracking-[0.16em] text-gold">
                  Follow our work
                </p>
                <a
                  href="https://instagram.com/homesbyfattori"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block font-cormorant text-2xl italic text-navy transition-colors hover:text-gold"
                >
                  @homesbyfattori
                </a>
              </div>

              <div className="space-y-2 border-t border-navy/10 pt-6 font-inter text-sm text-graytext">
                <p>Turnaround: 15–20 business days</p>
                <p>Ships worldwide</p>
                <p>Secure payment via Stripe</p>
              </div>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
