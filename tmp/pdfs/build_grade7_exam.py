from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader

OUT=Path('D:/HealthMate/output/pdf'); OUT.mkdir(parents=True,exist_ok=True)
TMP=Path('D:/HealthMate/tmp/pdfs'); TMP.mkdir(parents=True,exist_ok=True)
W,H=A4; L=43; R=W-43; CW=R-L
INK=colors.HexColor('#17212c'); GREY=colors.HexColor('#536170'); LIGHT=colors.HexColor('#d4dbe1')
pdfmetrics.registerFont(TTFont('ExamArial','C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ExamArialBold','C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFontFamily('ExamArial',normal='ExamArial',bold='ExamArialBold',italic='ExamArial',boldItalic='ExamArialBold')
STYLE=ParagraphStyle('body',fontName='ExamArial',fontSize=10.5,leading=15,textColor=INK)
SMALL=ParagraphStyle('small',parent=STYLE,fontSize=9,leading=12)
class Paper:
 def __init__(self,name,kind,total):
  self.path=OUT/name; self.c=canvas.Canvas(str(self.path),pagesize=A4); self.kind=kind; self.total=total; self.n=0; self.y=0
  self.c.setTitle('Grade 7 Science - Unit 12 Biological Processes - '+kind)
  self.c.setAuthor('Grade 7 Science')
 def page(self,title,sub=''):
  if self.n:self.c.showPage()
  self.n+=1; c=self.c; c.setFillColor(INK); c.setFont('Helvetica-Bold',9); c.drawString(L,H-31,'GRADE 7  |  SCIENCE  |  UNIT 12')
  c.setFont('Helvetica',8.5); c.drawRightString(R,H-31,self.kind.upper())
  c.setStrokeColor(LIGHT); c.line(L,H-41,R,H-41)
  c.setFillColor(INK); c.setFont('Helvetica-Bold',17); c.drawString(L,H-68,title)
  self.y=H-88
  if sub:self.p(sub,small=True);self.y-=4
  c.setStrokeColor(LIGHT);c.line(L,37,R,37);c.setFont('Helvetica',8);c.setFillColor(GREY)
  c.drawString(L,24,'Biological Processes');c.drawRightString(R,24,f'{self.n} / {self.total}')
 def p(self,text,small=False,x=None,width=None,gap=7):
  p=Paragraph(text,SMALL if small else STYLE); _,h=p.wrap(width or CW,700)
  p.drawOn(self.c,x or L,self.y-h);self.y-=h+gap
  assert self.y>=45,('overflow',self.n,self.y,text)
 def title(self,t):self.p('<b>'+t+'</b>');self.y-=1
 def q(self,t,marks):
  self.p(t+f' <b>[{marks}]</b>')
 def lines(self,n=1,width=None):
  self.c.setStrokeColor(LIGHT);self.c.setLineWidth(.45)
  for i in range(n): self.y-=18;self.c.line(L,self.y,L+(width or CW),self.y)
  self.y-=9;assert self.y>=45,('line overflow',self.n,self.y)
 def table(self,rows,widths,header=True):
  data=[[Paragraph(str(v),SMALL) for v in row]for row in rows]
  t=Table(data,colWidths=widths,hAlign='LEFT'); cmds=[('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.4,LIGHT),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]
  if header:cmds+=[('BACKGROUND',(0,0),(-1,0),colors.HexColor('#eef1f4'))]
  t.setStyle(TableStyle(cmds));_,h=t.wrap(CW,700);t.drawOn(self.c,L,self.y-h);self.y-=h+10;assert self.y>=45,('table overflow',self.n,self.y)
 def save(self):assert self.n==self.total;(self.c.save())

mcqs=[
('Which is the basic structural and functional unit of a living organism?', ['Cell','Tissue','Organ','System'],'A'),
('Which instrument is used to observe leaf epidermal cells and cheek cells?', ['Hand lens','Light microscope','Thermometer','Measuring cylinder'],'B'),
('Which sample is most suitable for looking for unicellular organisms?', ['Dry sand','Cooking oil','Fresh pond water','Salt crystals'],'C'),
('Which is an example of a tissue?', ['Stomach','Human body','Digestive system','Cardiac muscle tissue'],'D'),
('A leaf contains several types of tissues. What level of organisation is it?', ['Cell','Tissue','Organ','Organism'],'C'),
('Which tissue transports food through a plant?', ['Xylem','Phloem','Blood','Muscle'],'B'),
('Which pair belongs to the shoot system of a flowering plant?', ['Flowers and fruits','Tap root and lateral roots','Tap root and flower','Lateral roots and fruits'],'A'),
('Which group contains only organs that help digestion by producing secretions?', ['Heart, lungs and kidneys','Trachea, larynx and lungs','Salivary glands, liver and pancreas','Anus, rectum and appendix'],'C'),
('What is one role of the tongue during digestion?', ['Absorb water','Make bile','Pump blood','Mix food with saliva'],'D'),
('According to this unit, food may remain in the stomach for about:', ['3 minutes','3 hours','3 days','3 weeks'],'B'),
('The small intestine is approximately:', ['6 metres long','6 centimetres long','60 metres long','60 centimetres long'],'A'),
('Compared with the small intestine, the large intestine is:', ['Longer and narrower','Longer and wider','Shorter and narrower','Shorter and wider'],'D'),
('Several body systems work together to form a complete:', ['Cell','Tissue','Organism','Organ'],'C'),
('When does the human body need energy?', ['Only during sport','Only while eating','Only when awake','During activity and rest'],'D'),
('Which term means taking air into the body?', ['Digestion','Inspiration','Expiration','Absorption'],'B'),
('Which term means breathing air out?', ['Expiration','Inspiration','Digestion','Absorption'],'A'),
('During gas exchange in the lungs, oxygen moves into the:', ['Stomach','Large intestine','Blood','Oesophagus'],'C'),
('Which part is shared by the digestive and respiratory pathways?', ['Stomach','Pharynx','Small intestine','Bronchiole'],'B'),
('Which structure helps prevent food from entering the trachea during swallowing?', ['Villus','Appendix','Pancreas','Epiglottis'],'D'),
('Which part does NOT belong to the digestive system?', ['Liver','Stomach','Trachea','Anus'],'C'),
]

def mcq(p,start,end):
 for i in range(start,end):
  stem,opts,key=mcqs[i];p.p(f'<b>{i+1:02d}.</b> {stem}',gap=4)
  p.p('A. '+opts[0]+'<br/>B. '+opts[1]+'<br/>C. '+opts[2]+'<br/>D. '+opts[3],small=True,x=L+20,width=CW-20,gap=11)

def compact_mcq(p,start,end):
 for i in range(start,end):
  stem,opts,key=mcqs[i];p.p(f'<b>{i+1:02d}.</b> {stem}',gap=4)
  # Two columns preserve reading order A/B on first line, C/D on second.
  y=p.y
  for j,txt in enumerate(opts):
   par=Paragraph(chr(65+j)+'. '+txt,SMALL);_,h=par.wrap((CW-28)/2,100)
   par.drawOn(p.c,L+16+(j%2)*(CW/2),y-(j//2)*26-h)
  p.y=y-59

def digestive(c,cx,cy):
 # Diagram is schematic, designed for identifying organs rather than scale.
 c.setStrokeColor(INK);c.setFillColor(colors.white);c.setLineWidth(1.5)
 # mouth, pharynx and oesophagus
 c.ellipse(cx-21,cy+150,cx+21,cy+167,fill=0)
 c.line(cx+15,cy+151,cx+16,cy+132);c.line(cx+23,cy+153,cx+24,cy+132)
 c.line(cx+16,cy+132,cx+16,cy+55);c.line(cx+24,cy+132,cx+24,cy+55)
 # stomach on subject's left (viewer right)
 path=c.beginPath();path.moveTo(cx+24,cy+57);path.curveTo(cx+68,cy+79,cx+89,cy+35,cx+66,cy+9);path.curveTo(cx+46,cy-8,cx+15,cy+3,cx+5,cy+19);path.curveTo(cx-3,cy+33,cx+11,cy+44,cx+16,cy+57);c.drawPath(path)
 # liver on viewer left, gall bladder, pancreas
 path=c.beginPath();path.moveTo(cx-92,cy+51);path.curveTo(cx-69,cy+85,cx-5,cy+75,cx+7,cy+45);path.lineTo(cx-32,cy+29);path.lineTo(cx-91,cy+30);path.close();c.drawPath(path)
 c.ellipse(cx-43,cy+15,cx-29,cy+35)
 c.roundRect(cx-10,cy-8,75,13,6,fill=0)
 # large intestine outline as a broad inverted U
 path=c.beginPath();path.moveTo(cx-67,cy-111);path.lineTo(cx-67,cy-32);path.curveTo(cx-66,cy-18,cx-52,cy-18,cx-41,cy-18);path.lineTo(cx+76,cy-18);path.lineTo(cx+76,cy-113);path.curveTo(cx+76,cy-131,cx+42,cy-132,cx+21,cy-139);path.lineTo(cx+21,cy-177);c.drawPath(path)
 path=c.beginPath();path.moveTo(cx-53,cy-108);path.lineTo(cx-53,cy-34);path.lineTo(cx+62,cy-34);path.lineTo(cx+62,cy-105);path.curveTo(cx+62,cy-119,cx+8,cy-117,cx+7,cy-139);path.lineTo(cx+7,cy-177);c.drawPath(path)
 c.line(cx-67,cy-111,cx-53,cy-108)
 # small intestine loops
 for yy in [cy-48,cy-69,cy-90]:
  path=c.beginPath();path.moveTo(cx-37,yy);path.curveTo(cx+49,yy+14,cx+49,yy-15,cx-36,yy-11);c.drawPath(path)
 c.line(cx-36,cy-101,cx-54,cy-105)
 # appendix, anus
 path=c.beginPath();path.moveTo(cx-61,cy-111);path.curveTo(cx-76,cy-123,cx-66,cy-135,cx-57,cy-126);c.drawPath(path)
 c.ellipse(cx+7,cy-181,cx+21,cy-175)
 anchors=[('A',cx-10,cy+159,'L',cy+173),('B',cx+21,cy+142,'R',cy+145),('C',cx+20,cy+103,'R',cy+104),('D',cx-61,cy+53,'L',cy+72),('E',cx-36,cy+25,'L',cy+25),('F',cx+62,cy+35,'R',cy+55),('G',cx+45,cy-2,'R',cy+2),('H',cx+69,cy-56,'R',cy-50),('I',cx-7,cy-76,'L',cy-66),('J',cx-65,cy-123,'L',cy-124),('K',cx+14,cy-151,'R',cy-145),('L',cx+14,cy-179,'R',cy-184)]
 for lab,x,y,side,yy in anchors:
  end=cx-144 if side=='L' else cx+144;c.line(x,y,end,yy)
  c.setFillColor(INK);c.setFont('Helvetica-Bold',10);c.drawString(end-13 if side=='L' else end+5,yy-3,lab)

def belljar(c,cx,cy):
 c.setStrokeColor(INK);c.setLineWidth(1.6);c.setFillColor(colors.white)
 path=c.beginPath();path.moveTo(cx-105,cy-105);path.lineTo(cx-105,cy+34);path.curveTo(cx-105,cy+114,cx+105,cy+114,cx+105,cy+34);path.lineTo(cx+105,cy-105);c.drawPath(path)
 c.line(cx-7,cy+140,cx-7,cy+44);c.line(cx+7,cy+140,cx+7,cy+44)
 c.line(cx-7,cy+44,cx-49,cy+4);c.line(cx+1,cy+35,cx-41,cy-4)
 c.line(cx+7,cy+44,cx+49,cy+4);c.line(cx-1,cy+35,cx+41,cy-4)
 c.ellipse(cx-76,cy-55,cx-18,cy+4);c.ellipse(cx+18,cy-55,cx+76,cy+4)
 c.line(cx-106,cy-105,cx+106,cy-105)
 for label,x,y,ex,ey in [('P',cx,cy+82,cx+155,cy+111),('Q',cx+47,cy-26,cx+155,cy+11),('R',cx+100,cy+30,cx+155,cy-43),('S',cx+20,cy-105,cx+155,cy-112)]:
  c.line(x,y,ex,ey);c.setFont('Helvetica-Bold',11);c.setFillColor(INK);c.drawString(ex+5,ey-3,label)

p=Paper('Grade7_Science_Unit12_Exam_Paper.pdf','Examination paper',9)
p.page('Biological Processes','Unit examination | Time: 2 hours 30 minutes | Total: 100 marks')
p.p('Name: __________________________________  Class: __________  Date: ______________')
p.p('<b>Instructions</b><br/>Answer every question. Choose one answer for each multiple-choice question. Write short answers in the spaces provided. Use a pencil for diagrams. Marks are shown in square brackets.',small=True)
p.table([['Section','Questions','Marks'],['A - Multiple choice','1-20','20'],['B - Structured questions','21-28','80'],['Total','','100']],[260,130,CW-390])
p.title('Section A - Multiple choice')
p.p('Each question carries 1 mark. Circle A, B, C or D.',small=True)
compact_mcq(p,0,5)
p.page('Section A - continued','Questions 6-13 | 1 mark each')
compact_mcq(p,5,13)
p.page('Section A - continued','Questions 14-20 | 1 mark each')
compact_mcq(p,13,20)
p.p('<b>Section A total: 20 marks</b>',small=True)
p.page('Section B - Cells and tissues','Answer all questions. Use scientific words where possible.')
p.title('21. Cells and organisation [12 marks]')
p.q('(a) State the two reasons why the cell is called the basic unit of life.',2);p.lines(2)
p.q('(b) Explain the difference between unicellular and multicellular organisms.',2);p.lines(2)
p.q('(c) Name two unicellular organisms given in this unit.',2);p.lines(2)
p.q('(d) Complete the order from the simplest level to the most complex level.<br/>Cell &rarr; __________ &rarr; __________ &rarr; __________ &rarr; organism',3)
p.q('(e) What is a tissue? Include its cells and their function in your answer.',2);p.lines(2)
p.q('(f) Name the plant part used in this unit to observe plant cells under a microscope.',1);p.lines(1)
p.page('Section B - Plant and body organisation')
p.title('22. Tissues and a practical investigation [10 marks]')
p.q('(a) Must all cells in a tissue have the same shape? State one feature shared by the cells of a tissue.',2);p.lines(2)
p.q('(b) Name three types of tissue found in the human stomach.',3);p.lines(1)
p.q('(c) A balsam plant is placed with its roots in red-coloured water. A thin stem section is later observed under a microscope.<br/>i. Name the tissue stained red. ii. State what this tissue normally transports.',2);p.lines(2)
p.q('(d) Name the tissue that transports food in a plant. Where is it found in relation to the xylem in the stem shown in this unit?',2);p.lines(2)
p.q('(e) A leaf cross-section contains different tissues working together. What level of organisation does the whole leaf represent?',1);p.lines(1)
p.title('23. Systems and organisms [8 marks]')
p.q('(a) Name the two main systems of a flowering plant. Give one organ belonging to each system.',4);p.lines(2)
p.q('(b) What is an organ system? Include both its parts and their function.',2);p.lines(2)
p.q('(c) Name two human body systems other than the digestive and respiratory systems.',2);p.lines(1)
p.page('Section B - Digestive system')
p.title('24. Identify the digestive organs [12 marks]')
p.p('Write the name of each labelled part, A-L. Each correct name carries 1 mark. The diagram is simplified and is not drawn to scale.',small=True)
digestive(p.c,W/2,H-352)
p.y=H-555
p.table([['Label','Name','Label','Name'],['A','________________________','G','________________________'],['B','________________________','H','________________________'],['C','________________________','I','________________________'],['D','________________________','J','________________________'],['E','________________________','K','________________________'],['F','________________________','L','________________________']],[40,CW/2-40,40,CW/2-40])
p.page('Section B - Digestion and absorption')
p.title('25. How food is digested [12 marks]')
p.q('(a) What is digestion? State the other main function of the digestive system after food has been digested.',3);p.lines(3)
p.q('(b) Explain mechanical digestion in the mouth. Then explain chemical digestion and name the fluid that starts it in the mouth.',3);p.lines(3)
p.q('(c) State two features of the stomach that help it digest food.',2);p.lines(3)
p.q('(d) Name the finger-like projections in the small intestine. Explain how they help the absorption of digested food.',2);p.lines(3)
p.q('(e) State one function of the large intestine and one function of the anus.',2);p.lines(3)
p.page('Section B - Respiration and breathing')
p.title('26. Energy and respiration [10 marks]')
p.q('(a) Name two biological activities, other than respiration, that need energy.',2);p.lines(2)
p.q('(b) Complete the word equation for respiration using four suitable words or phrases.<br/>__________ + __________ &rarr; __________ + water + __________',4);p.lines(1)
p.q('(c) State one difference between breathing and respiration. In which part of the body does the reaction of respiration take place?',2);p.lines(2)
p.q('(d) State the direction in which oxygen and carbon dioxide move between the lungs and the blood.',2);p.lines(2)
p.title('27. The pathway of air [8 marks]')
p.q('(a) Put these five parts in the correct order between the nasal cavity and the lungs:<br/><b>trachea, bronchioles, pharynx, bronchi, larynx</b><br/>Nasal cavity &rarr; __________ &rarr; __________ &rarr; __________<br/>&rarr; __________ &rarr; __________ &rarr; lungs',5);p.lines(1)
p.q('(b) State three changes that happen to inhaled air as it passes through the nasal cavity.',3);p.lines(2)
p.page('Section B - A breathing model')
p.title('28. Investigating breathing [8 marks]')
p.p('Study the bell-jar model below. The diagram is simplified.',small=True)
belljar(p.c,W/2-35,H-284)
p.y=H-418
p.q('(a) Name the human body part represented by each labelled model part.<br/>P - Y-shaped tube: __________________  Q - balloons: __________________<br/>R - bell jar: ________________________  S - rubber membrane: ___________',4)
p.q('(b) The rubber membrane is pulled down. What happens to the balloons? Which breathing movement does this represent?',2);p.lines(2)
p.q('(c) The rubber membrane is pushed up. What happens to the balloons? Which breathing movement does this represent?',2);p.lines(2)
p.p('<b>Section B total: 80 marks</b><br/><b>END OF EXAMINATION - Check that you have answered all questions.</b>',small=True)
p.save()

g=Paper('Grade7_Science_Unit12_Answers_and_Coverage.pdf','Teacher guide',6)
g.page('Answers and marking guide','Grade 7 Science | Unit 12: Biological Processes | Total: 100 marks')
g.p('Use this guide after students finish the examination. Accept scientifically correct answers in the student\'s own words. Award marks for correct ideas; spelling errors should not lose marks when the intended scientific term is clear.',small=True)
g.title('Mark allocation')
g.table([['Section / question','Marks'],['A: 20 multiple-choice questions','20'],['B: Q21 / Q22 / Q23','12 / 10 / 8'],['B: Q24 / Q25','12 / 12'],['B: Q26 / Q27 / Q28','10 / 8 / 8'],['Total','100']],[CW-95,95])
g.title('Section A - Answer key')
g.table([['Question','Answer','Question','Answer']]+[[str(i+1),mcqs[i][2],str(i+11),mcqs[i+10][2]]for i in range(10)],[90,100,90,CW-280])
g.p('The paper is an English-medium unit assessment, not an official past paper. Suggested duration: 2 hours 30 minutes. All questions are compulsory so that the three main areas are assessed for every student.',small=True)
g.page('Marking guide - Organisation')
g.title('21. Cells and organisation [12]')
for text in [
 '(a) The cell is the structural/building unit (1) and the functional/basic working unit (1).',
 '(b) A unicellular organism has one cell (1); a multicellular organism has more than one cell/many cells (1).',
 '(c) Any two of Amoeba, Euglena and Paramecium (1 each; 2 total).',
 '(d) Cell → tissue → organ → system → organism. Three gaps: 1 each (3 total).',
 '(e) A tissue is a group of cells (1) organised to carry out a common function (1).',
 '(f) Lower epidermis of a betel leaf / lower leaf epidermis (1).']:
 g.p(text)
g.title('22. Tissues and practical investigation [10]')
for text in [
 '(a) No; cells may have the same or different shapes (1). They carry out a common function (1).',
 '(b) Blood tissue, muscle tissue and nerve tissue (1 each; 3 total).',
 '(c) Xylem (1); transports water and dissolved minerals (1; both required).',
 '(d) Phloem (1); outside the xylem in the stem diagram in the unit (1).',
 '(e) Organ (1).']:
 g.p(text)
g.title('23. Systems and organisms [8]')
g.p('(a) Root system (1), with a root/tap root/lateral root (1); shoot system (1), with stem/leaf/flower/fruit (1).')
g.p('(b) A group of organs (1) working together to perform a common function or functions (1).')
g.p('(c) Any two: nervous, reproductive, blood circulatory, muscular or excretory system (1 each). Accept another correct human organ system.')
g.page('Marking guide - Digestion')
g.title('24. Digestive diagram [12]')
g.table([['Label','Organ','Label','Organ'],['A','Mouth / mouth cavity','G','Pancreas'],['B','Pharynx','H','Large intestine'],['C','Oesophagus','I','Small intestine'],['D','Liver','J','Appendix'],['E','Gall bladder','K','Rectum'],['F','Stomach','L','Anus']],[40,CW/2-40,40,CW/2-40])
g.p('Award 1 mark per correct label. Accept esophagus for oesophagus.',small=True)
g.title('25. Digestion and absorption [12]')
for t in [
 '(a) Breaking down complex/large food (1) into simple substances (1); absorption of digested/simple food into the body (1).',
 '(b) Teeth break food into smaller pieces (1). Chemical digestion breaks food into simpler substances using digestive juices (1). Saliva starts chemical digestion in the mouth (1).',
 '(c) Any two: muscular walls/sac churn and mix food; digestive juices act on food; acidic conditions help digestion. Award 1 per correct feature (2 total). Storage time alone is not a feature that explains digestion.',
 '(d) Villi (1); increase surface area for absorbing digested food (1).',
 '(e) Large intestine absorbs water (1); anus releases faeces from the body (1).']:
 g.p(t)
g.p('<b>Scientific wording:</b> Villi increase the surface area mainly for absorption. Respiration releases energy from food; it is different from the movement of air during breathing. These distinctions clarify simplified wording in the textbook.',small=True)
g.page('Marking guide - Respiration')
g.title('26. Energy and respiration [10]')
for t in [
 '(a) Any two suitable examples: movement, digestion, excretion, playing, dancing or other biological activities requiring energy (1 each).',
 '(b) Simple food + oxygen → carbon dioxide + water + energy. Four gaps: simple food/glucose (1), oxygen (1), carbon dioxide (1), energy (1).',
 '(c) Breathing is moving air in and out; respiration is the reaction of simple food with oxygen that releases energy (1 for a clear difference). Respiration occurs in cells (1). Do not require the term mitochondria.',
 '(d) Oxygen moves from air in the lungs into the blood (1); carbon dioxide moves from the blood into the lungs (1).']:
 g.p(t)
g.title('27. Pathway of air [8]')
g.p('(a) Nasal cavity → pharynx → larynx → trachea → bronchi → bronchioles → lungs. Award 1 for each of the five inserted parts in its correct position (5 total). The sequence is simplified; alveoli are not required in this unit.')
g.p('(b) Air is warmed (1), filtered/cleaned (1) and moistened (1).')
g.title('28. Bell-jar model [8]')
g.p('(a) P: trachea and two bronchi (1; both); Q: lungs (1); R: chest/thoracic cavity or rib cage enclosing the chest (1); S: diaphragm (1).')
g.p('(b) Balloons inflate/expand (1); inhalation/inspiration/breathing in (1).')
g.p('(c) Balloons deflate/become smaller (1); exhalation/expiration/breathing out (1).')
g.p('<b>Teacher note:</b> The jar is rigid and does not show rib movement. Do not require students to discuss this limitation for marks. The bell-jar movement questions are a simple application of the model activity in the unit.',small=True)
g.page('Coverage check - Unit content','Source checked: EG7_Sci_Chap12.pdf, all 17 PDF pages (printed pages 11-27).')
g.p('Both numbered sections and their main content areas are represented. The source heading 12.2 includes digestion and respiration. All questions are compulsory. The checklist below shows the assessed content.',small=True)
rows=[['Unit area / topic','Textbook pages','Exam questions'],
 ['12.1: Cell as structural and functional unit; plant and animal cells; microscopy','11-13','1, 2, 21(a), 21(f)'],
 ['Unicellular and multicellular organisms; Amoeba, Euglena, Paramecium; pond observations','12-13','3, 21(b-c)'],
 ['Cell → tissue → organ → system → organism','13-18','5, 13, 21(d-e), 22(e), 23'],
 ['Tissue cell shapes and common function; cardiac muscle, blood, epidermis; stomach tissues','13-15','4, 21(e-f), 22(a-b)'],
 ['Red-dye plant experiment; xylem, phloem; stem and leaf as organs','14-15','6, 22(c-e)'],
 ['Plant organs; root and shoot systems; human systems working together','16-18','7, 13, 23'],
 ['12.2: Biological processes; energy during activity and rest','19','14, 26(a-c)'],
 ['Mechanical and chemical digestion; saliva, teeth, tongue; absorption','19-22','9, 25(a-b), 25(d)'],
 ['Digestive structures: mouth, glands, pharynx, oesophagus, liver, gall bladder, stomach, pancreas, intestines, appendix, rectum, anus','16, 21-22','8, 18, 20, 24'],
 ['Stomach features/storage; small intestine length/villi; large intestine structure/water; faeces','21-22','10-12, 25(c-e)'],
 ['Respiration reaction; cells; oxygen, food, energy, carbon dioxide and water; inhalation/exhalation','22-24','14-17, 26, 28(b-c)'],
 ['Air pathway; nasal conditioning; gas exchange; epiglottis','23-24','17-19, 26(d), 27'],
 ['Breathing model: Y-tube, balloons, bell jar and membrane','25','28']]
g.table(rows,[CW*.58,CW*.15,CW*.27])
g.p('The summary and end-of-unit exercise are revisited across Questions 1, 6, 18, 20, 22, 24-28. Scientific vocabulary is tested through naming, labelling and explanation.',small=True)
g.page('Coverage check - Activities and follow-up')
g.p('Classroom activities are adapted into written observation, diagram or application questions. A written exam does not demonstrate the practical skills of using a microscope or building a model.',small=True)
g.table([['Textbook activity','Written assessment link'],
 ['12.1: Observe leaf and cheek cells','Q2 and Q21(f)'],
 ['12.2: Observe unicellular organisms in water','Q3 and Q21(b-c)'],
 ['12.3: Observe muscle and epidermal tissues','Q4, Q21(e-f), Q22(a-b)'],
 ['12.4: Balsam plant in red-coloured water','Q22(c-d)'],
 ['12.5: Study a leaf cross-section','Q5 and Q22(e)'],
 ['12.6: Identify plant organs and systems','Q7 and Q23(a)'],
 ['12.7: Model the organisational levels','Q21(d) and Q23(b)'],
 ['12.8-12.9: Identify/model digestive organs','Q24 diagram and Q25 functions'],
 ['12.10: Identify respiratory parts','Q18-20 and Q27(a)'],
 ['12.11-12.12: Build and interpret a breathing model','Q28 model, part matching and movement']],[CW*.55,CW*.45])
g.title('Optional follow-up tasks - outside the 100 marks')
g.p('<b>1. Cell discovery (Assignment 12.1):</b> Use a reliable science book to find the name of a scientist involved in discovering cells. Write the scientist\'s name, one finding and the source you used. This is research homework; the chapter does not supply the historical answer.')
g.p('<b>2. Grass plant (Assignment 12.2):</b> Draw a grass plant. Label its roots, stem and leaves. Mark the root system and shoot system.')
g.p('<b>3. Models and observation:</b> Under teacher supervision, observe prepared cell/tissue slides or make one model of body organisation, the digestive system or the respiratory system. Explain its parts to the class.')
g.p('<b>Coverage result:</b> All main teaching sections are assessed in the 100-mark paper. The research assignments and model-making tasks are retained here as optional follow-up work. No historical facts absent from the source are required for examination marks.',small=True)
g.save()

for path,expected in [(p.path,9),(g.path,6)]:
 reader=PdfReader(path); assert len(reader.pages)==expected
 for n,page in enumerate(reader.pages,1):
  txt=page.extract_text();assert len(txt)>100,(path,n)
 print(path, 'pages=',len(reader.pages),'bytes=',path.stat().st_size)
print('MARK AUDIT:',20+12+10+8+12+12+10+8+8)
