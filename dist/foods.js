export const GROUPS=[
 {id:'grain',label:'곡류',short:'곡류',color:'#ffd75c',icon:'rice',hint:'곡류도 골고루!'},
 {id:'protein',label:'고기·생선·달걀·콩',short:'단백질',color:'#ffc747',icon:'fish',hint:'생선·달걀·콩도 골고루!'},
 {id:'vegetable',label:'채소류',short:'채소',color:'#8dcf45',icon:'carrot',hint:'채소를 더 먹어 봐!'},
 {id:'fruit',label:'과일류',short:'과일',color:'#ff7782',icon:'apple',hint:'과일도 골고루!'},
 {id:'dairy',label:'우유·유제품',short:'유제품',color:'#65d0ef',icon:'milk',hint:'우유·유제품도 챙겨요!'},
 {id:'sugar',label:'유지·당류',short:'당류',color:'#ca8ee9',icon:'sesame_oil'},
 {id:'water',label:'물',short:'수분',color:'#59bafa',icon:'water'}
];
export const FOODS=[
 ['rice','밥',0,'food'],['corn','옥수수',0,'food'],['potato','감자',0,'food'],
 ['fish','생선',1,'food'],['egg','달걀',1,'food'],['tofu','두부',1,'food'],
 ['carrot','당근',2,'food'],['broccoli','브로콜리',2,'food'],['cucumber','오이',2,'food'],
 ['apple','사과',3,'food'],['banana','바나나',3,'food'],['grapes','포도',3,'food'],
 ['milk','우유',4,'food'],['cheese','치즈',4,'food'],['yogurt','무가당 요구르트',4,'food'],
 ['sesame_oil','참기름',5,'snack'],['soda','가당 탄산음료',5,'snack'],
 ['water','물',6,'water'],['badbread','곰팡이 핀 빵',-1,'spoiled'],['badapple','상한 사과',-1,'spoiled']
].map(([id,name,group,kind])=>({id,name,group,kind,label:({yogurt:'요구르트',badbread:'상한 빵',badapple:'상한 사과',soda:'탄산음료'})[id]||name,image:`assets/icons/${id}.svg`}));
export const byId=id=>FOODS.find(f=>f.id===id);
