import icon1Mobile from './preview-mobile/1.png';
import icon2Mobile from './preview-mobile/2.png';
import icon3Mobile from './preview-mobile/3.png';
import icon4Mobile from './preview-mobile/4.png';
import icon5Mobile from './preview-mobile/5.png';
import icon6Mobile from './preview-mobile/6.png';
import icon7Mobile from './preview-mobile/7.png';

import icon1Desktop from './preview-desktop/1.png';
import icon2Desktop from './preview-desktop/2.png';
import icon3Desktop from './preview-desktop/3.png';
import icon4Desktop from './preview-desktop/4.png';
import icon5Desktop from './preview-desktop/5.png';
import icon6Desktop from './preview-desktop/6.png';
import icon7Desktop from './preview-desktop/7.png';

import internet_1 from './internet/1.png';
import internet_2 from './internet/2.png';
import internet_4 from './internet/4.png';

import nad_mlekiem_1 from './nad_mlekiem/1.png';
import nad_mlekiem_2 from './nad_mlekiem/2.png';
import nad_mlekiem_4 from './nad_mlekiem/4.png';

import hammer_1 from './hammer/1.png';
import hammer_2 from './hammer/2.png';
import hammer_4 from './hammer/4.png';

import night_1 from './night/1.png';
import night_2 from './night/2.png';
import night_4 from './night/4.png';

import flexbox_1 from './flexbox/1.png';
import flexbox_2 from './flexbox/2.png';
import flexbox_4 from './flexbox/4.png';

import snejki_1 from './snejki/1.png';
import snejki_2 from './snejki/2.png';
import snejki_4 from './snejki/4.png';

import drekon_1 from './drekon/1.png';
import drekon_2 from './drekon/2.png';
import drekon_4 from './drekon/4.png';

var allMobilePreviews = [
  icon1Mobile,
  icon2Mobile,
  icon3Mobile,
  icon4Mobile,
  icon5Mobile,
  icon6Mobile,
  icon7Mobile,
  // icon7Mobile,
  // icon7Mobile,
];

var allDekstopPreviews = [
  icon1Desktop,
  icon2Desktop,
  icon3Desktop,
  icon4Desktop,
  icon5Desktop,
  icon6Desktop,
  icon7Desktop,
  // icon7Desktop,
  // icon7Desktop,
];

export var allTiny = window.isMobile ? allMobilePreviews : allDekstopPreviews;

export var allPreviews = [
    {
        srcset: `${night_1} 400w,${night_2} 1134w,${night_4} 2072w`,
        src: night_4,
        maxwidth: 2072,
    },
    {
        srcset: `${hammer_1} 400w,${hammer_2} 1136w,${hammer_4} 2059w`,
        src: hammer_4,
        maxwidth: 2059,
    },
    {
        srcset: `${nad_mlekiem_1} 400w,${nad_mlekiem_2} 1245w,${nad_mlekiem_4} 2151w`,
        src: nad_mlekiem_4,
        maxwidth: 2151,
    },
    {
        srcset: `${flexbox_1} 400w,${flexbox_2} 1058w,${flexbox_4} 1963w`,
        src: flexbox_4,
        maxwidth: 1963,
    },
    {
        srcset: `${internet_1} 480w,${internet_2} 1190w,${internet_4} 2090w`,
        src: internet_4,
        maxwidth: 2090,
    },
    {
        srcset: `${drekon_1} 400w,${drekon_2} 1121w,${drekon_4} 2055w`,
        src: drekon_4,
        maxwidth: 2055,
    },
    {
        srcset: `${snejki_1} 400w,${snejki_2} 1063w,${snejki_4} 1982w`,
        src: snejki_4,
        maxwidth: 1982,
    },
    // {
    //   srcset: `${snejki_1} 400w,${snejki_2} 1149w,${snejki_4} 2071w`,
    //   src: snejki_4,
    //   maxwidth: 1982,
    // },
    // {
    //     srcset: `${snejki_1} 400w,${snejki_2} 1142w,${snejki_4} 2071w`,
    //     src: snejki_4,
    //     maxwidth: 1982,
    // },
];