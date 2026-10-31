interface TechnologyBrand {
    slug: string;
    color: string;
}

const technologyBrands: Record<string, TechnologyBrand> = {
    laravel: { slug: 'laravel', color: 'FF2D20' },
    laravelmvc: { slug: 'laravel', color: 'FF2D20' },
    eloquentorm: { slug: 'laravel', color: 'FF2D20' },
    authentication: { slug: 'laravel', color: 'FF2D20' },
    requestvalidation: { slug: 'laravel', color: 'FF2D20' },
    middleware: { slug: 'laravel', color: 'FF2D20' },
    apiresources: { slug: 'laravel', color: 'FF2D20' },
    php: { slug: 'php', color: '777BB4' },
    spring: { slug: 'spring', color: '6DB33F' },
    springboot: { slug: 'springboot', color: '6DB33F' },
    restapi: { slug: 'postman', color: 'FF6C37' },
    restapis: { slug: 'postman', color: 'FF6C37' },
    mysql: { slug: 'mysql', color: '4479A1' },
    postgresql: { slug: 'postgresql', color: '4169E1' },
    postgres: { slug: 'postgresql', color: '4169E1' },
    sqlite: { slug: 'sqlite', color: '003B57' },
    supabase: { slug: 'supabase', color: '3FCF8E' },
    react: { slug: 'react', color: '61DAFB' },
    html: { slug: 'html5', color: 'E34F26' },
    html5: { slug: 'html5', color: 'E34F26' },
    css: { slug: 'css3', color: '1572B6' },
    css3: { slug: 'css3', color: '1572B6' },
    cascadingstylesheets: { slug: 'css3', color: '1572B6' },
    jquery: { slug: 'jquery', color: '0769AD' },
    typescript: { slug: 'typescript', color: '3178C6' },
    javascript: { slug: 'javascript', color: 'F7DF1E' },
    java: { slug: 'java', color: 'ED8B00' },
    javaprogramming: { slug: 'java', color: 'ED8B00' },
    python: { slug: 'python', color: '3776AB' },
    git: { slug: 'git', color: 'F05032' },
    github: { slug: 'github', color: '181717' },
    githubdesktop: { slug: 'github', color: '181717' },
    aws: { slug: 'amazonaws', color: 'FF9900' },
    amazonwebservices: { slug: 'amazonaws', color: '232F3E' },
    amazonwebservicesaws: { slug: 'amazonaws', color: 'FF9900' },
    vercel: { slug: 'vercel', color: 'FFFFFF' },
    linux: { slug: 'linux', color: 'FCC624' },
    windows: { slug: 'windows', color: '0078D4' },
    microsoftwindows: { slug: 'windows', color: '0078D4' },
    vite: { slug: 'vite', color: '646CFF' },
    tailwind: { slug: 'tailwindcss', color: '06B6D4' },
    tailwindcss: { slug: 'tailwindcss', color: '06B6D4' },
    inertia: { slug: 'inertia', color: '9553E9' },
    inertiajs: { slug: 'inertia', color: '9553E9' },
    nodejs: { slug: 'nodedotjs', color: '5FA04E' },
    express: { slug: 'express', color: 'FFFFFF' },
    mongodb: { slug: 'mongodb', color: '47A248' },
    redis: { slug: 'redis', color: 'FF4438' },
    docker: { slug: 'docker', color: '2496ED' },
    postman: { slug: 'postman', color: 'FF6C37' },
    composer: { slug: 'composer', color: '885630' },
};

export function automaticTechnologyIconUrl(name: string): string | null {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const brand = technologyBrands[key];

    return brand ? `https://cdn.simpleicons.org/${brand.slug}/${brand.color}` : null;
}
