<?xml version="1.0" encoding="UTF-8"?>
<!--  akn2html-xslt1.xsl  –  minimal Akoma Ntoso ➜ HTML, XSLT 1.0  -->
<xsl:stylesheet version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:akn="http://docs.oasis-open.org/legaldocml/ns/akn/3.0"
      exclude-result-prefixes="akn">

  <xsl:output method="html" indent="yes" encoding="UTF-8"/>

  <!-- ========================================================
       1  ROOT  (single HTML page)
  ========================================================= -->
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <title>

        </title>
        <style>
          body{font:14px/1.5 sans-serif;margin:2em;}
          article{margin-bottom:4em;border-bottom:1px solid #999;}
          h1{font:30px/1.5 sans-serif;font-weight: bold;margin:1.5em 0 .3em 0}
          h2,h3{margin:1.5em 0 .3em 0}
          h4,h5{margin:1.2em 0 .3em 0}
          .metadata ul{margin:.3em 0 1.2em 1.5em}
        </style>
      </head>
      <body>
        <xsl:apply-templates select="/AknXmlList/Results/akn:akomaNtoso"/>
      </body>
    </html>
  </xsl:template>

  <!-- ========================================================
       2  DOCUMENT LEVEL
  ========================================================= -->
  <xsl:template match="akn:akomaNtoso">
    <xsl:apply-templates select="akn:act"/>
  </xsl:template>

  <xsl:template match="akn:act">
    <article>
      <!-- heading -->
      <h1>
        <xsl:value-of select="akn:preface//akn:docNumber"/>
        <xsl:text> – </xsl:text>
        <xsl:value-of select="akn:preface//akn:docTitle"/>
      </h1>

      <!-- get the ISO language code once -->
      <xsl:variable name="lang"
                    select="akn:meta/akn:identification/akn:FRBRExpression
                            /akn:FRBRlanguage/@language"/>

      <!-- choose label texts -->
      <xsl:variable name="lab-issued">
        <xsl:choose>
          <xsl:when test="$lang='fin'">Antopäivä</xsl:when>
          <xsl:when test="$lang='swe'">Meddelats</xsl:when>
          <xsl:otherwise>Issued</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="lab-published">
        <xsl:choose>
          <xsl:when test="$lang='fin'">Julkaisupäivä</xsl:when>
          <xsl:when test="$lang='swe'">Publiceringsdag</xsl:when>
          <xsl:otherwise>Published</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- simple metadata -->
      <section class="metadata">
        <h3>Metadata</h3>
        <ul>
          <li><xsl:value-of select="$lab-issued"/>:
            <xsl:value-of
              select="akn:meta/akn:identification/akn:FRBRWork
                      /akn:FRBRdate[@name='dateIssued']/@date"/></li>
          <li><xsl:value-of select="$lab-published"/>:
            <xsl:value-of
              select="akn:meta/akn:identification/akn:FRBRWork
                      /akn:FRBRdate[@name='datePublished']/@date"/></li>
        </ul>
      </section>

      <!-- preamble + body -->
      <xsl:apply-templates select="akn:preamble | akn:body"/>
    </article>
  </xsl:template>

  <!-- ========================================================
       3  CONTENT  (preamble, body, chapters …)
  ========================================================= -->
  <xsl:template match="akn:preamble">
    <section class="preamble">
      <h3></h3>
      <xsl:apply-templates/>
    </section>
  </xsl:template>

  <xsl:template match="akn:body">
    <section class="body">
      <h3></h3>
      <xsl:apply-templates/>
    </section>
  </xsl:template>

  <!-- hierarchy -->
  <xsl:template match="akn:chapter">
    <div class="chapter">
      <h2><xsl:value-of select="akn:num"/><br/><xsl:value-of select="akn:heading"/></h2>
      <xsl:apply-templates
         select="*[not(self::akn:num or self::akn:heading)]"/>
    </div>
  </xsl:template>

  <xsl:template match="akn:section">
    <div class="section">
      <h3><xsl:value-of select="akn:num"/><xsl:text>  </xsl:text><xsl:value-of select="akn:heading"/></h3>
      <xsl:apply-templates
         select="*[not(self::akn:num or self::akn:heading)]"/>
    </div>
  </xsl:template>

  <xsl:template match="akn:subsection">
    <div class="subsection"><xsl:apply-templates/></div>
  </xsl:template>

  <!-- paragraphs -->
  <xsl:template match="akn:paragraph">
    <p><xsl:value-of select="normalize-space(.)"/></p>
  </xsl:template>

  <xsl:template match="akn:p">
    <p><xsl:apply-templates/></p>
  </xsl:template>


</xsl:stylesheet>