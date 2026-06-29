import {
  Html,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Img,
  Row,
  Column,
  Preview,
} from "@react-email/components"

interface OrderConfirmationProps {
  customerName: string
  orderCode: string
  orderId: string
  productName: string
  purchaseDate: string
  logoSrc: string
}

export function OrderConfirmationEmail({
  customerName,
  orderCode,
  orderId,
  productName,
  purchaseDate,
  logoSrc,
}: OrderConfirmationProps) {
  return (
    <Html>
      <Preview>
        Votre code produit : {orderCode} — Merci pour votre commande
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={logoSrc}
              alt="Thika 25"
              width="120"
              height="60"
              style={logo}
            />
            <Heading as="h1" style={companyName}>
              Thika 25
            </Heading>
          </Section>

          <Section style={thankYouSection}>
            <Heading as="h2" style={thankYouHeading}>
              Merci pour votre commande&nbsp;!
            </Heading>
            <Text style={greetingText}>
              {customerName ? `Bonjour ${customerName},` : "Bonjour,"}
            </Text>
            <Text style={bodyText}>
              Nous avons bien reçu votre commande. Vous trouverez ci-dessous
              votre code produit personnel.
            </Text>
          </Section>

          <Section style={codeBox}>
            <Text style={codeLabel}>Votre code produit</Text>
            <Text style={codeValue}>{orderCode}</Text>
          </Section>

          <Section style={keepNoteSection}>
            <Text style={keepNote}>
              Gardez cet email précieusement — il contient votre code produit.
              Vous en aurez besoin pour le suivi de votre commande.
            </Text>
          </Section>

          <Section style={detailsSection}>
            <Heading as="h3" style={detailsHeading}>
              Détails de la commande
            </Heading>

            <Row style={detailRow}>
              <Column style={detailLabel}>Produit</Column>
              <Column style={detailValue}>{productName}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Commande</Column>
              <Column style={detailValue}>#{orderId.slice(0, 8)}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Date</Column>
              <Column style={detailValue}>{purchaseDate}</Column>
            </Row>
            {customerName && (
              <Row style={detailRow}>
                <Column style={detailLabel}>Client</Column>
                <Column style={detailValue}>{customerName}</Column>
              </Row>
            )}
          </Section>

          <Hr style={divider} />

          <Section style={supportSection}>
            <Text style={supportText}>
              Besoin d&apos;aide&nbsp;? Contactez-nous sur WhatsApp au{" "}
              <Text style={phoneNumber}>+213 550 58 58 84</Text>
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footerSection}>
            <Text style={footerText}>
              © 2026 Thika 25. Tous droits réservés.
            </Text>
            <Text style={footerSmall}>
              Cet email est généré automatiquement. Merci de ne pas y répondre.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: "#f5f5f5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
}

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "20px 0",
}

const header = {
  textAlign: "center" as const,
  padding: "30px 20px 10px",
}

const logo = {
  margin: "0 auto 10px",
}

const companyName = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#0A0A0A",
  margin: "0",
}

const thankYouSection = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "30px",
  margin: "20px 0",
}

const thankYouHeading = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#0A0A0A",
  margin: "0 0 12px",
}

const greetingText = {
  fontSize: "14px",
  color: "#0A0A0A",
  margin: "0 0 8px",
}

const bodyText = {
  fontSize: "14px",
  color: "#525252",
  lineHeight: "22px",
  margin: "0",
}

const codeBox = {
  backgroundColor: "#FFF5F0",
  borderRadius: "16px",
  border: "1px solid rgba(255, 87, 34, 0.2)",
  padding: "24px",
  margin: "20px 0",
  textAlign: "center" as const,
}

const codeLabel = {
  fontSize: "12px",
  fontWeight: "500",
  color: "#737373",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 12px",
}

const codeValue = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#FF5722",
  fontFamily: "'Courier New', Courier, monospace",
  letterSpacing: "2px",
  margin: "0",
}

const keepNoteSection = {
  backgroundColor: "#FFFBEB",
  borderRadius: "12px",
  padding: "16px 20px",
  margin: "20px 0",
}

const keepNote = {
  fontSize: "13px",
  color: "#92400E",
  lineHeight: "20px",
  margin: "0",
  textAlign: "center" as const,
}

const detailsSection = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "30px",
  margin: "20px 0",
}

const detailsHeading = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#0A0A0A",
  margin: "0 0 16px",
}

const detailRow = {
  marginBottom: "8px",
}

const detailLabel = {
  fontSize: "13px",
  color: "#737373",
  width: "40%",
}

const detailValue = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#0A0A0A",
  width: "60%",
}

const divider = {
  borderColor: "#E5E5E5",
  margin: "24px 0",
}

const supportSection = {
  textAlign: "center" as const,
  padding: "0 20px",
}

const supportText = {
  fontSize: "13px",
  color: "#525252",
  margin: "0",
}

const phoneNumber = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#FF5722",
  margin: "4px 0 0",
}

const footerSection = {
  textAlign: "center" as const,
  padding: "0 20px",
}

const footerText = {
  fontSize: "12px",
  color: "#A3A3A3",
  margin: "0 0 4px",
}

const footerSmall = {
  fontSize: "11px",
  color: "#D4D4D4",
  margin: "0",
}
