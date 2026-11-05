/* Hum Fauji Initiatives - Financial calculators
   Educational estimates only. Review assumptions and formulas with HFI compliance
   and financial-planning teams before publishing to production. */
(() => {
  "use strict";

  const INR = new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0
  });
  const number = value => Number(value);
  const money = value => INR.format(Number.isFinite(value) ? value : 0);
  const pct = value => `${Number(value).toFixed(2)}%`;
  const safe = value => Number.isFinite(value) && value >= 0;

  const configs = {
    sip: {
      title: "SIP Calculator", kicker: "INVESTMENT PLANNING",
      description: "Estimate how your monthly investments may grow over time.",
      fields: [
        { id:"monthly", label:"Monthly investment", prefix:"₹", value:15000, min:500, max:1000000, step:500 },
        { id:"years", label:"Investment period", suffix:"years", value:15, min:1, max:60, step:1 },
        { id:"rate", label:"Expected annual return", suffix:"% p.a.", value:12, min:0, max:30, step:.5 }
      ],
      calculate:v => {
        const months = v.years * 12, r = v.rate / 1200;
        const invested = v.monthly * months;
        const future = r === 0 ? invested : v.monthly * ((Math.pow(1+r,months)-1)/r) * (1+r);
        return { cards:[["Total invested",money(invested)],["Estimated value",money(future)],["Estimated gains",money(future-invested)]],
          note:"Assumes each monthly contribution is made at the beginning of the month and a constant monthly return. Actual market returns vary." };
      }
    },
    delay: {
      title:"SIP Delay Calculator", kicker:"START EARLY",
      description:"See how delaying a monthly investment can affect its estimated future value.",
      fields:[
        {id:"monthly",label:"Monthly SIP amount",prefix:"₹",value:10000,min:500,max:1000000,step:500},
        {id:"years",label:"Total goal period from today",suffix:"years",value:20,min:2,max:60,step:1},
        {id:"delay",label:"Delay before starting SIP",suffix:"years",value:5,min:0,max:30,step:1},
        {id:"rate",label:"Expected annual return",suffix:"% p.a.",value:12,min:0,max:30,step:.5}
      ],
      calculate:v=>{
        if(v.delay>=v.years) throw Error("The delay must be shorter than the total goal period.");
        const fv=(n)=>{const m=n*12,r=v.rate/1200;return r===0?v.monthly*m:v.monthly*((Math.pow(1+r,m)-1)/r)*(1+r);};
        const early=fv(v.years), late=fv(v.years-v.delay);
        return {cards:[["Start now",money(early)],["Start after delay",money(late)],["Estimated difference",money(early-late)]],
          note:`The delayed scenario invests for ${v.years-v.delay} years instead of ${v.years} years. Both scenarios use the same monthly SIP and assumed return.`};
      }
    },
    stepup: {
      title:"SIP Step-Up Calculator", kicker:"GROW YOUR INVESTMENT",
      description:"Estimate the impact of increasing your SIP amount every year.",
      fields:[
        {id:"monthly",label:"Starting monthly SIP",prefix:"₹",value:10000,min:500,max:1000000,step:500},
        {id:"step",label:"Annual SIP increase",suffix:"%",value:10,min:0,max:50,step:1},
        {id:"years",label:"Investment period",suffix:"years",value:20,min:1,max:50,step:1},
        {id:"rate",label:"Expected annual return",suffix:"% p.a.",value:12,min:0,max:30,step:.5}
      ],
      calculate:v=>{
        let corpus=0, invested=0, sip=v.monthly, r=v.rate/1200;
        for(let year=0;year<v.years;year++){
          for(let m=0;m<12;m++){
            corpus=corpus*(1+r)+sip;
            invested+=sip;
          }
          sip*=1+v.step/100;
        }
        return {cards:[["Total invested",money(invested)],["Estimated value",money(corpus)],["Estimated gains",money(corpus-invested)]],
          note:"SIP increases once every 12 months. Contributions are assumed at month-end for this step-up illustration; returns are assumed constant."};
      }
    },
    education: {
      title:"Education Calculator", kicker:"PLAN FOR THEIR DREAMS",
      description:"Estimate the future cost of an education goal after inflation.",
      fields:[
        {id:"cost",label:"Current estimated education cost",prefix:"₹",value:2000000,min:10000,max:100000000,step:10000},
        {id:"years",label:"Years until education",suffix:"years",value:10,min:1,max:40,step:1},
        {id:"inflation",label:"Assumed education inflation",suffix:"% p.a.",value:8,min:0,max:20,step:.5}
      ],
      calculate:v=>{
        const future=v.cost*Math.pow(1+v.inflation/100,v.years);
        return {cards:[["Cost today",money(v.cost)],["Estimated future cost",money(future)],["Increase due to inflation",money(future-v.cost)]],
          note:"Uses a constant assumed education-cost inflation rate. Actual course fees and inflation may differ."};
      }
    },
    marriage: {
      title:"Marriage Calculator", kicker:"PLAN AHEAD",
      description:"Estimate how much a wedding budget today may cost in the future.",
      fields:[
        {id:"cost",label:"Wedding budget at today's cost",prefix:"₹",value:1500000,min:10000,max:100000000,step:10000},
        {id:"years",label:"Years until the goal",suffix:"years",value:8,min:1,max:40,step:1},
        {id:"inflation",label:"Assumed expense inflation",suffix:"% p.a.",value:6,min:0,max:20,step:.5}
      ],
      calculate:v=>{
        const future=v.cost*Math.pow(1+v.inflation/100,v.years);
        return {cards:[["Budget today",money(v.cost)],["Estimated future budget",money(future)],["Increase due to inflation",money(future-v.cost)]],
          note:"This is an inflation-based estimate, not a wedding quotation. Actual costs depend on location, choices and market conditions."};
      }
    },
    retirement: {
      title:"Retirement Calculator", kicker:"PLAN YOUR SECOND INNINGS",
      description:"Estimate the retirement corpus needed to support your planned expenses.",
      fields:[
        {id:"age",label:"Your current age",suffix:"years",value:35,min:18,max:75,step:1},
        {id:"retire",label:"Retirement age",suffix:"years",value:60,min:25,max:85,step:1},
        {id:"expense",label:"Monthly household expense today",prefix:"₹",value:60000,min:5000,max:10000000,step:1000},
        {id:"inflation",label:"Assumed inflation",suffix:"% p.a.",value:6,min:0,max:15,step:.5},
        {id:"postReturn",label:"Assumed annual return during retirement",suffix:"% p.a.",value:7,min:0,max:20,step:.5},
        {id:"postYears",label:"Years of retirement income",suffix:"years",value:25,min:1,max:50,step:1}
      ],
      calculate:v=>{
        if(v.retire<=v.age) throw Error("Retirement age must be greater than current age.");
        const years=v.retire-v.age;
        const firstAnnual=v.expense*12*Math.pow(1+v.inflation/100,years);
        const g=v.inflation/100, r=v.postReturn/100, n=v.postYears;
        let corpus;
        if(Math.abs(r-g)<0.000001) corpus=firstAnnual*n/(1+r);
        else corpus=firstAnnual/(r-g)*(1-Math.pow((1+g)/(1+r),n));
        if(!Number.isFinite(corpus)||corpus<0) corpus=firstAnnual*n;
        return {cards:[["Years until retirement",`${years} years`],["Estimated first-year annual expense",money(firstAnnual)],["Estimated retirement corpus",money(corpus)]],
          note:"Simplified model: expenses rise with the selected inflation rate during retirement and withdrawals are annual, at year-end. It excludes taxes, pension, existing savings and other income. Discuss a personalised cash-flow plan with an adviser."};
      }
    },
    lumpsum: {
      title:"Lumpsum Calculator", kicker:"ONE-TIME INVESTMENT",
      description:"Estimate the future value of a one-time investment.",
      fields:[
        {id:"amount",label:"One-time investment",prefix:"₹",value:500000,min:1000,max:100000000,step:1000},
        {id:"years",label:"Investment period",suffix:"years",value:10,min:1,max:60,step:1},
        {id:"rate",label:"Expected annual return",suffix:"% p.a.",value:10,min:0,max:30,step:.5}
      ],
      calculate:v=>{
        const future=v.amount*Math.pow(1+v.rate/100,v.years);
        return {cards:[["Invested amount",money(v.amount)],["Estimated future value",money(future)],["Estimated gains",money(future-v.amount)]],
          note:"Assumes annual compounding at a constant rate. Market-linked investments do not deliver fixed or guaranteed returns."};
      }
    },
    tax: {
      title:"Tax Estimator", kicker:"TAX AWARENESS",
      description:"A simple estimate using the effective tax rate you enter. This is not an official tax computation.",
      fields:[
        {id:"income",label:"Annual taxable income",prefix:"₹",value:1200000,min:0,max:100000000,step:10000},
        {id:"rate",label:"Estimated effective tax rate",suffix:"%",value:10,min:0,max:50,step:.5},
        {id:"cess",label:"Additional cess / surcharge allowance",suffix:"%",value:0,min:0,max:30,step:.25}
      ],
      calculate:v=>{
        const base=v.income*v.rate/100;
        const extra=base*v.cess/100;
        const total=base+extra;
        return {cards:[["Taxable income entered",money(v.income)],["Estimated tax",money(total)],["Estimated post-tax income",money(v.income-total)]],
          note:"Enter an effective rate based on the applicable tax regime and financial year. This estimator does not apply statutory slabs, rebates, deductions, exemptions, surcharge thresholds or special-rate income. Verify with a tax professional."};
      }
    },
    hlv: {
      title:"HLV Calculator", kicker:"PROTECT WHAT MATTERS",
      description:"Estimate a broad life-cover need based on income replacement, liabilities and existing assets.",
      fields:[
        {id:"income",label:"Annual family income requirement",prefix:"₹",value:1200000,min:0,max:100000000,step:10000},
        {id:"years",label:"Years of income support required",suffix:"years",value:20,min:1,max:50,step:1},
        {id:"rate",label:"Assumed annual discount rate",suffix:"% p.a.",value:6,min:0,max:20,step:.5},
        {id:"liabilities",label:"Outstanding loans / liabilities",prefix:"₹",value:2500000,min:0,max:100000000,step:10000},
        {id:"assets",label:"Existing assets earmarked for family",prefix:"₹",value:1000000,min:0,max:100000000,step:10000}
      ],
      calculate:v=>{
        const r=v.rate/100, n=v.years;
        const incomeNeed=r===0?v.income*n:v.income*(1-Math.pow(1+r,-n))/r;
        const need=Math.max(0,incomeNeed+v.liabilities-v.assets);
        return {cards:[["Present value of income need",money(incomeNeed)],["Loans added",money(v.liabilities)],["Estimated additional cover need",money(need)]],
          note:"Simplified present-value estimate. It excludes existing insurance, future expenses, taxes, inflation adjustments and personal circumstances. A full HLV assessment should be completed with a qualified adviser."};
      }
    }
  };

  const nav=document.getElementById("calculator-nav");
  const form=document.getElementById("calculator-form");
  const fields=document.getElementById("fields");
  const results=document.getElementById("results");
  let current="sip";

  function makeField(field){
    const wrap=document.createElement("div"); wrap.className="field";
    const label=document.createElement("label"); label.htmlFor=field.id;
    label.innerHTML=`<span>${field.label}</span><span class="field-hint">${field.prefix||field.suffix||""}</span>`;
    const row=document.createElement("div"); row.className="input-row";
    const input=document.createElement("input"); input.type="number"; input.id=field.id; input.name=field.id;
    input.min=field.min; input.max=field.max; input.step=field.step; input.value=field.value; input.required=true;
    const range=document.createElement("input"); range.type="range"; range.min=field.min; range.max=field.max; range.step=field.step; range.value=field.value;
    range.setAttribute("aria-label",field.label);
    const badge=document.createElement("span"); badge.className="range-value";
    const format=v=>field.prefix?`${field.prefix}${Number(v).toLocaleString("en-IN")}`:field.suffix?`${v} ${field.suffix}`:Number(v).toLocaleString("en-IN");
    badge.textContent=format(field.value);
    input.addEventListener("input",()=>{range.value=input.value;badge.textContent=format(input.value);});
    range.addEventListener("input",()=>{input.value=range.value;badge.textContent=format(range.value);});
    row.append(range,badge); wrap.append(label,input,row); return wrap;
  }

  function render(key){
    current=key; const c=configs[key];
    document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.calculator===key));
    document.getElementById("calculator-title").textContent=c.title;
    document.getElementById("calculator-kicker").textContent=c.kicker;
    document.getElementById("calculator-description").textContent=c.description;
    fields.replaceChildren(...c.fields.map(makeField));
    results.hidden=true;
  }

  function showResults(output){
    const cards=output.cards.map(([label,value])=>{
      const card=document.createElement("div"); card.className="result-card";
      const span=document.createElement("span"); span.textContent=label;
      const strong=document.createElement("strong"); strong.textContent=value;
      card.append(span,strong); return card;
    });
    document.getElementById("result-cards").replaceChildren(...cards);
    document.getElementById("result-note").textContent=output.note;
    results.hidden=false;
    results.scrollIntoView({behavior:"smooth",block:"nearest"});
  }

  nav.addEventListener("click",e=>{
    const button=e.target.closest("[data-calculator]");
    if(button) render(button.dataset.calculator);
  });

  form.addEventListener("submit",e=>{
    e.preventDefault();
    const c=configs[current], values={};
    for(const f of c.fields){
      const input=document.getElementById(f.id), value=number(input.value);
      if(!input.value || !safe(value) || value<f.min || value>f.max){
        input.focus(); alert(`Please enter a valid value for: ${f.label}.`); return;
      }
      values[f.id]=value;
    }
    try { showResults(c.calculate(values)); }
    catch(error){ alert(error.message||"Please check the values entered."); }
  });

  form.addEventListener("reset",()=>setTimeout(()=>{render(current);},0));
  document.getElementById("year").textContent=new Date().getFullYear();
  render("sip");
})();
