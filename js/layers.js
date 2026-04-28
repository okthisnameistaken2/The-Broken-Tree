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

    color: "#e10c81",

    requires: new Decimal(10),

    resource: "prestige points",
    baseResource: "points",
    baseAmount() { return player.points },

    type: "normal",
    exponent: 0.5,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("p", 15)) mult = mult.times(2)
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
                return player.points.plus(1).pow(0.25)
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
            description: "Points boost prestige point gain (remember to make work)",
            cost: new Decimal(1000),
        },
    },
    buyables: {
    11: {
        title: "Point Booster",

        cost(x) {
            return new Decimal(1).times(new Decimal(3).pow(x))
        },

        effect(x) {
            return new Decimal(2).pow(x)
        },
        display() {
    let cost = this.cost(getBuyableAmount(this.layer, this.id))

    return "Boost points\n" +
           "Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n" +
           "Currently: ×" + format(this.effect()) + "\n" +
           "Cost: " + format(cost) + " prestige points"
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
}
})