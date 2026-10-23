# WACH

WACH is a static bilingual website for an audiovisual production company. It presents the studio, its projects, and project detail pages in Spanish and English.

## Implemented pages and features

- Spanish home page: `index.html`
- English home page: `en/index.html`
- Spanish about page: `pages/nosotros.html`
- English about page: `en/nosotros.html`
- Spanish project detail page: `pages/project.html?slug=<project-slug>`
- English project detail page: `en/project.html?slug=<project-slug>`
- Responsive navigation, language links, project filters, lazy project loading, project detail rendering, Vimeo embeds, scroll reveals, and animated counters.
- Administrative project editor at `admin/admin.html`, backed by the existing Supabase integration.

## Technologies

The site uses semantic HTML, modular CSS, and browser JavaScript. Public project data is read from `assets/data/projects.json`; project media URLs and the admin integration use the existing remote services configured in the repository. No framework or build step is required.

## Structure

```text
index.html              Spanish home page
en/                     English pages
pages/                  Spanish secondary pages
admin/                  Existing admin interface
assets/                 Images, video, icons, and public project data
css/                    Base, layout, component, and page styles
js/                     Navigation and page behavior
CNAME                   Custom domain configuration
site.webmanifest        Web app metadata
```

## Run locally

From the repository root, start any static HTTP server and open the address it reports. For example, if Python is available:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/`. A local HTTP server is required for fetch-based project data; opening the files directly from `file://` is not supported.

## Configuration

The public site reads the checked-in project data file. The admin interface requires the existing Supabase project configuration and an authorized Supabase user; do not replace public configuration with private credentials or commit secrets. If configuration is moved to environment-specific deployment settings, use placeholders such as `SUPABASE_URL` and `SUPABASE_ANON_KEY` outside version control.

## Publication

The repository includes `CNAME` with the custom domain `somoswach.com`, which is the publication configuration present in this repository. No build command is required. GitHub Pages branch and directory settings are managed outside the repository and were not inferred beyond the checked-in files.
