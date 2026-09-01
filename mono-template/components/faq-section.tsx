"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/components/language-provider"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { fetchFaqs } from "@/lib/data"
import type { Faq } from "@/lib/types"

export function FaqSection() {
  const { locale, isRTL } = useLanguage()
  const [faqs, setFaqs] = useState<Faq[]>([])

  useEffect(() => {
    fetchFaqs().then(setFaqs)
  }, [])

  if (faqs.length === 0) return null

  return (
    <section
      id="faq"
      className="w-full bg-white py-24 md:py-32 px-6"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className={`text-3xl md:text-5xl font-light text-[#0A0A0A] ${
              isRTL ? "font-[family-name:var(--font-tajawal)]" : ""
            }`}
          >
            {locale === "fr" ? "FAQ" : "الأسئلة الشائعة"}
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-b border-[#E5E5E5] last:border-0"
            >
              <AccordionTrigger
                className={`text-left text-base font-medium text-[#0A0A0A] hover:text-[#FF5722] data-[state=open]:text-[#FF5722] transition-colors py-5 ${
                  isRTL
                    ? "font-[family-name:var(--font-tajawal)] text-right"
                    : ""
                }`}
              >
                {locale === "fr" ? item.questionFr : item.questionAr}
              </AccordionTrigger>
              <AccordionContent
                className={`text-muted-foreground text-sm leading-relaxed pb-5 ${
                  isRTL ? "font-[family-name:var(--font-tajawal)] text-right" : ""
                }`}
              >
                {locale === "fr" ? item.answerFr : item.answerAr}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
