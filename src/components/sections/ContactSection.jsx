import React, { useState, useMemo } from "react";
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  Zap,
  Mail,
  MapPin,
  Globe,
  Check,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import AnimatedBg from "../ui/AnimatedBg";
import SocialIcon from "../ui/SocialIcon";
import PrimaryButton from "../ui/PrimaryButton";
const ContactSection = () => {
  const { addMessage, siteConfig } = useData();
  const config = useMemo(
    () => siteConfig?.contactDetails || {},
    [siteConfig?.contactDetails],
  );
  const socialLinks = useMemo(
    () => siteConfig?.socialLinks || {},
    [siteConfig?.socialLinks],
  );

  const content = {
    subtitle: "Reach Beyond",
    title: "Connect With Us",
    description:
      "Initiate protocol to transmit your signal directly to the elite force.",
  };

  const leadership = useMemo(
    () =>
      config.leadership || [
        {
          id: 1,
          name: "Sahan Perera",
          role: "President",
          phone: "+94 77 123 4567",
          whatsapp: "94771234567",
        },
        {
          id: 2,
          name: "Amila Silva",
          role: "Secretary",
          phone: "+94 77 987 6543",
          whatsapp: "94779876543",
        },
      ],
    [config.leadership],
  );

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("transmitting");
    try {
      await addMessage(formState);
      setFormState({ name: "", email: "", message: "" });
      setStatus("success");
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      setStatus("error");
    }
  };

  const socialItems = useMemo(() => {
    const items = Object.entries(socialLinks)
      .filter(([key, link]) => link && link.trim() !== "")
      .map(([key, link]) => ({
        iconNode: <SocialIcon platform={key} size={18} />,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        href: link,
      }));

    items.push({
      iconNode: <Mail size={18} />,
      label: "Email",
      href: `mailto:${config.email || "icmediaunit@gmail.com"}`,
    });
    return items;
  }, [socialLinks, config.email]);

  return (
    <section
      id="contact"
      className="flex overflow-hidden relative flex-col min-h-[100dvh] py-24 lg:py-0 text-white bg-[#010104]">
      <AnimatedBg variant="contact" />

      <div className="container flex relative z-10 flex-col flex-1 justify-center px-4 mx-auto max-w-7xl md:px-6">
        <div className="grid gap-8 items-start lg:grid-cols-12 md:gap-10">
          {/* Left: Branding & Core Signals */}
          <div className="space-y-6 lg:col-span-5 animate-fade-in-right">
            <div className="space-y-2">
              <h2 className="text-primary-neon tracking-[0.5em] uppercase text-[10px] font-black opacity-60 flex items-center gap-3">
                <Zap size={14} className="animate-pulse" /> {content.subtitle}
              </h2>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-[0.9] tracking-tighter uppercase">
                {content.title}
              </h1>
              <p className="max-w-md text-sm font-light leading-relaxed text-white/70">
                {content.description}
              </p>
            </div>

            {/* Contact Numbers - full width, no social beside */}
            <div className="space-y-4">
              <h3 className="text-white font-bold uppercase tracking-[0.2em] text-[10px] opacity-40">
                Direct Access
              </h3>
              <div className="space-y-4">
                {leadership.map((member, i) => (
                  <div
                    key={i}
                    className="group bg-white/[0.03] border border-white/[0.06]  rounded-2xl px-5 py-4 flex items-center justify-between hover:border-primary-neon/20 transition-all">
                    <div>
                      <p className="text-primary-neon text-[8px] font-black uppercase tracking-widest mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {member.role}
                      </p>
                      <h4 className="font-bold text-white transition-colors group-hover:text-primary-neon">
                        {member.name}
                      </h4>
                      <p className="text-white/70 text-[11px] font-medium mt-0.5">
                        {member.phone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`tel:${member.phone.replace(/\s+/g, "")}`}
                        className="flex justify-center items-center w-9 h-9 rounded-full border transition-all bg-white/5 text-white/60 hover:bg-white hover:text-dark border-white/[0.06]  active:scale-90"
                        title="Call Now">
                        <Phone size={14} />
                      </a>
                      <a
                        href={`https://wa.me/${member.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-[#25D366] hover:text-white transition-all border border-white/[0.06]  active:scale-90"
                        title="WhatsApp Message">
                        <SocialIcon platform="whatsapp" size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media Row - at the bottom of left column */}
            <div className="space-y-3">
              <h3 className="text-white font-bold uppercase tracking-[0.2em] text-[10px] opacity-40">
                Follow Us
              </h3>
              <div className="flex flex-wrap gap-3 items-center">
                {socialItems.map(({ iconNode, label, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    className="flex justify-center items-center w-10 h-10 rounded-2xl border transition-all bg-white/5 border-white/[0.06]  text-white/60 hover:text-primary-neon hover:border-primary-neon/30 hover:bg-primary-neon/10">
                    {iconNode}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7 animate-fade-in-left">
            <div className="glass p-1 md:p-1.5 rounded-2xl border border-white/[0.06]  bg-white/[0.01] relative overflow-hidden shadow-2xl">
              <form
                onSubmit={handleSubmit}
                className="bg-dark/40 backdrop-blur-sm rounded-2xl p-5 md:p-6 space-y-4 relative overflow-hidden">
                {/* Form Grain/Noise Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none ')]"></div>

                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600/20"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                  </div>
                  <span className="text-primary-neon/40 text-[8px] font-black uppercase tracking-[0.4em]">
                    Encrypted Terminal v4.0
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="contact-name"
                        className="text-white/70 text-[9px]  uppercase tracking-[0.3em] ml-6 font-medium">
                        Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) =>
                          setFormState({ ...formState, name: e.target.value })
                        }
                        className="w-full bg-white/[0.03] border border-white/[0.06]  rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-neon/30 transition-all placeholder:text-white/10 font-medium text-sm"
                        placeholder="Enter Full Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="contact-email"
                        className="text-white/70 text-[9px]  uppercase tracking-[0.3em] ml-6 font-medium">
                        Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) =>
                          setFormState({ ...formState, email: e.target.value })
                        }
                        className="w-full bg-white/[0.03] border border-white/[0.06]  rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-neon/30 transition-all placeholder:text-white/10 font-medium text-sm"
                        placeholder="yourname@domain.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="contact-message"
                        className="text-white/70 text-[9px]  uppercase tracking-[0.3em] ml-6 font-medium">
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        rows="4"
                        required
                        value={formState.message}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            message: e.target.value,
                          })
                        }
                        className="w-full bg-white/[0.03] border border-white/[0.06]  rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-neon/30 transition-all placeholder:text-white/10 font-medium text-sm resize-none"
                        placeholder="Transmit your message parameters..."></textarea>
                    </div>

                    {/* Simulated reCAPTCHA */}
                    <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.06]  rounded-2xl px-6 py-4 group/captcha transition-all hover:bg-white/[0.04]">
                      <div className="relative">
                        <input
                          id="contact-recaptcha"
                          type="checkbox"
                          required
                          className="peer appearance-none w-6 h-6 border-2 border-white/5 rounded-2xl checked:bg-primary-neon checked:border-primary-neon transition-all cursor-pointer"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                          <Check
                            size={14}
                            className="text-dark -mt-1"
                            strokeWidth={3}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label
                          htmlFor="contact-recaptcha"
                          className="block text-white text-[11px] font-bold tracking-widest uppercase cursor-pointer">
                          I'm not a robot
                        </label>
                        <p className="text-white/60 text-[8px] font-black tracking-[0.3em] uppercase mt-0.5">
                          Verification Protocol Required
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-1 opacity-20">
                        <div className="w-6 h-6 bg-[url('https://www.gstatic.com/recaptcha/api2/logo_48.png')] bg-contain bg-no-repeat grayscale group-hover/captcha:grayscale-0 transition-all"></div>
                        <span className="text-[6px] font-black uppercase text-center leading-none">
                          reCAPTCHA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <PrimaryButton
                  type="submit"
                  disabled={status === "transmitting"}
                  className="w-full"
                  showArrow={status !== "success"}
                >
                  {status === "transmitting"
                    ? "Transmitting..."
                    : status === "success"
                      ? "Message Sent"
                      : "Send Message"}
                </PrimaryButton>

                <div className="flex gap-6 justify-center items-center pt-2">
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/60">
                    <ShieldCheck size={12} className="text-primary-neon/40" />
                    SSL SECURED
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/10"></div>
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/60">
                    <Globe size={12} className="text-primary-neon/40" /> GLOBAL
                    UPLINK
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
