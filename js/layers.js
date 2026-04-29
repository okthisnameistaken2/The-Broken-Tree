addLayer("p", {
    name: "prestige",
    symbol: "P",
    position: 0,

    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },

    color: "#e4479d",

    requires: new Decimal(10),

    resource: "prestige points",
    baseResource: "points",
    baseAmount() { return player.points },

    type: "normal",
    exponent() {
    return hasUpgrade("p", 18) ? 0.6 : 0.5
},

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("p", 15)) mult = mult.times(2)
        if (hasUpgrade("p", 21)) mult = mult.times(upgradeEffect("p", 21))
        if (hasUpgrade("s", 11)) {
        mult = mult.times(upgradeEffect("s", 11).prestige)
        }
        return mult
    },

    gainExp() {
        return new Decimal(1)
    },
    row: 0,

    hotkeys: [
        {
            key: "p",
            description: "P: Reset for prestige points",
            onPress() {
                if (canReset(this.layer)) doReset(this.layer)
            }
        },
    ],

    layerShown() { return true },

    upgrades: {
        11: {
            title: "A nice start",
            description: "Multiply point gain by 2",
            cost: new Decimal(1),
        },
        12: {
            title: "Another nice start",
            description: "Multiply point gain by 3",
            cost: new Decimal(3),
        },
        13: {
            title: "This might be a lot",
            description: "Multiply point gain by 5",
            cost: new Decimal(10),
        },
        14: {
            title: "Originality? In my prestige tree?",
            description: "Points boost point gain",
            cost: new Decimal(25),
            effect() {
        let base = player.points.plus(1).pow(0.25)

        if (hasUpgrade("p", 17)) {
            base = base.pow(upgradeEffect("p", 17))
        }
        return base
    },
            effectDisplay() {
                return "×" + format(this.effect())
            },
        },
        15: {
            title: "When will it end?",
            description: "Multiply prestige point gain by 2",
            cost: new Decimal(100),
        },
        16: {
            title: "The end?",
            description: "Points boost prestige point gain",
            cost: new Decimal(1000),
            effect() {
            return player.points.plus(1).pow(0.25)
        },

        effectDisplay() {
            return "×" + format(this.effect())
        },
        },
        17: {
        title: "Original originality",
        description: "Upgrade 14 is stronger",
        cost: new Decimal(3000),

        effect() {
            return new Decimal(1.5)
        },

          effectDisplay() {
             return "×" + format(this.effect()) + " to Upgrade 14 scaling"
         },
        },
        18: {
    title: "You can change that?",
    description: "Prestige formula is stronger",
    cost: new Decimal(100000),

    unlocked() {
        return true
    },
},
    },
    buyables: {
    11: {
        title: "Point Booster",
        cost(x) { 
    let amt = getBuyableAmount("p", 11)

    let base = new Decimal(3)

    // ===== YOUR ORIGINAL SCALING =====
    if (amt.gte(15)) {
        let extra = amt.minus(15).times(0.2)
        base = base.plus(extra)

        if (base.gt(5)) base = new Decimal(5)
    }

    let cost = new Decimal(10).times(base.pow(x))

    // ===== NEW 50+ EXPONENTIAL SOFTCAP =====
    if (amt.gte(50)) {
        let overflow = amt.minus(50)

        // smooth exponential pressure ramp
        let softcap = new Decimal(1.15).pow(overflow.div(10)).times(overflow.pow(0.2)).plus(1)

        cost = cost.pow(softcap)
    }

    return cost
},

 effect(x) {
    let expBoost = layers.p.buyables[12].effect(getBuyableAmount("p", 12))

    return new Decimal(2).plus(
        new Decimal(0.05).times(getBuyableAmount("p", 12))
    ).pow(x)
},
        display() {
    let amt = getBuyableAmount(this.layer, this.id)

    let cost = this.cost(amt)

    let tag = ""

    if (amt.gte(50)) {
        tag = " (softcapped^2)"
    } else if (amt.gte(15)) {
        tag = " (softcapped)"
    }

    return "Boost points\n" +
        "Level: " + formatWhole(amt) + "\n" +
        "Currently: ×" + format(this.effect()) + "\n" +
        "Cost: " + format(cost) + " prestige points" +
        tag
},
        unlocked() {
            return hasUpgrade("p", 15)
        },

        canAfford() {
            return player[this.layer].points.gte(this.cost(getBuyableAmount(this.layer, this.id)))
        },

        buy() {
            let cost = this.cost(getBuyableAmount(this.layer, this.id))
            if (player[this.layer].points.gte(cost)) {
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            }
        },
    },
    12: {
    title: "Buyable but better",

    cost(x) {
        return new Decimal(1000).times(new Decimal(2).pow(x))
    },

    effect(x) {
        return new Decimal(1).plus(new Decimal(0.05).times(x))
    },

    display() {
        return "Boost Buyable 11 scaling\n" +
               "Current exponent: ×" + format(this.effect()) + "\n" +
               "Cost: " + format(this.cost(getBuyableAmount(this.layer, this.id))) + " prestige points"
    },

    unlocked() {
        return hasUpgrade("p", 17)
    },

    canAfford() {
        return player[this.layer].points.gte(
            this.cost(getBuyableAmount(this.layer, this.id))
        )
    },

    buy() {
        let amt = getBuyableAmount(this.layer, this.id)
        let cost = this.cost(amt)

        if (player[this.layer].points.gte(cost)) {
            player[this.layer].points = player[this.layer].points.sub(cost)
            setBuyableAmount(this.layer, this.id, amt.add(1))
        }
    },
},
},
update(diff) {
    if (hasMilestone("s", 1)) {

        let gain = getResetGain("p")

        // safety check in case function isn't available
        if (gain === undefined) {
            gain = player.points.plus(1).pow(this.exponent || 0.5)
        }

        player.p.points = player.p.points.plus(gain.times(0.10).times(diff))
    }
},
doReset(resettingLayer) {
    if (resettingLayer == "s") {

        if (hasMilestone("s", 2)) {

            let keep = new Set([11, 12, 13, 14])

            player.p.upgrades = player.p.upgrades.filter(id => keep.has(id))
        }
    }
},
})
addLayer("s", {
    name: "sacrifice",
    symbol: "S",
    position: 1,
    row: 1,

    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },

    color: "#adeb0e",

    resource: "sacrifice points",
    baseResource: "points",

    baseAmount() {
        return player.points
    },

    type: "normal",
    exponent: 0.5,

    layerShown() {
    return player[this.layer].unlocked
},
    requires: new Decimal("1e10"),

    // 🔒 ONLY ALLOW RESET AT 1e20
    canReset() {
        return player.points.gte("1e10")
    },

    gainMult() {
        return new Decimal(1)
    },

    gainExp() {
        return new Decimal(1)
    },

    hotkeys: [
        {
            key: "s",
            description: "S: Reset for sacrifice points",
            onPress() {
                if (canReset(this.layer)) doReset(this.layer)
            }
        },
    ],
    update(diff) {
    if (!player[this.layer].unlocked && player.points.gte("1e8")) {
        player[this.layer].unlocked = true
    }
},
milestones: {
    1: {
        requirementDescription: "5 Sacrifice Points",
        effectDescription: "Generate 10% of prestige point gain automatically",

        done() {
            return player[this.layer].points.gte(5)
        },
    },
12: {
        requirementDescription: "2e7 Sacrifice Points",
        effectDescription: "Keep upgrades on reset.",

        done() {
            return player.s.points.gte("2e7")
        },

        onComplete() {
            // optional hook (not always used in TMT, so we also enforce in update)
        },
    },
},
upgrades: {
    11: {
        title: "This'll get you back",
        description: "Boost points and prestige point gain",

        cost: new Decimal(3),

        effect() {
            return {
                points: new Decimal(10),
                prestige: new Decimal(5),
            }
        },

        effectDisplay() {
            let eff = this.effect()
            return "×" + format(eff.points) + " points, ×" + format(eff.prestige) + " prestige"
        },
    },
    21: {
    title: "I know you were missing this kind of upgrade",
    description: "Sacrifice points boost point gain",
    cost: new Decimal("1e6"),

    effect() {
        return player.s.points.plus(1).pow(0.25)
    },

    effectDisplay() {
        return "×" + format(this.effect())
    },
},
31: {
    title: "Automation begins",
    description: "Automatically buy Prestige Buyables 11 and 12",
    cost: new Decimal("1e35"),
},
41: {
    title: "Remember that other upgrade?",
    description: "Improves prestige exponent from 0.6 to 0.65",
    cost: new Decimal("1e50"),
},
},
update(diff) {

    if (hasUpgrade("s", 31)) {

        // Buyable 11 max
        while (layers.p.buyables[11].canAfford()) {
            layers.p.buyables[11].buy()
        }

        // Buyable 12 max
        while (layers.p.buyables[12].canAfford()) {
            layers.p.buyables[12].buy()
        }
    }

    // keep your unlock logic
    if (!player.s.unlocked && player.points.gte("1e8")) {
        player.s.unlocked = true
    }
},
})